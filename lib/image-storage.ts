import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * Download an image from a URL and upload it to Supabase Storage
 * Returns the permanent public URL
 */
export async function saveImageToStorage(params: {
  imageUrl: string
  bucket: string
  path: string
  userId: string
}): Promise<string> {
  const { imageUrl, bucket, path, userId } = params

  try {
    // Download the image from the temporary URL
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }

    const imageBlob = await response.blob()
    const arrayBuffer = await imageBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: imageBlob.type || 'image/png',
        upsert: true,
      })

    if (error) {
      console.error('Error uploading image to storage:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  } catch (error) {
    console.error('Error saving image to storage:', error)
    // Return original URL as fallback
    return imageUrl
  }
}

/**
 * Generate a unique path for an image
 */
export function generateImagePath(params: {
  userId: string
  websiteId?: string
  type: 'logo' | 'hero' | 'feature' | 'product' | 'section' | 'team' | 'service'
  index?: number
}): string {
  const { userId, websiteId, type, index } = params
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)

  const folder = websiteId ? `${userId}/${websiteId}` : userId
  const filename = index !== undefined
    ? `${type}-${index}-${timestamp}-${random}.png`
    : `${type}-${timestamp}-${random}.png`

  return `${folder}/${filename}`
}

/**
 * Save multiple images to storage in parallel
 */
export async function saveImagesToStorage(params: {
  images: Array<{ url: string; type: string; index?: number }>
  bucket: string
  userId: string
  websiteId?: string
}): Promise<Array<{ originalUrl: string; permanentUrl: string }>> {
  const { images, bucket, userId, websiteId } = params

  const uploadPromises = images.map(async (image) => {
    const path = generateImagePath({
      userId,
      websiteId,
      type: image.type as any,
      index: image.index,
    })

    const permanentUrl = await saveImageToStorage({
      imageUrl: image.url,
      bucket,
      path,
      userId,
    })

    return {
      originalUrl: image.url,
      permanentUrl,
    }
  })

  return Promise.all(uploadPromises)
}

/**
 * Save all images for a website when publishing
 * This is called only when a website is published to save costs
 */
export async function saveWebsiteImagesOnPublish(params: {
  websiteId: string
  userId: string
}): Promise<{ success: boolean; savedCount: number; errors: string[] }> {
  const { websiteId, userId } = params
  const supabase = await createServerSupabaseClient()
  const errors: string[] = []
  let savedCount = 0

  try {
    console.log(`Saving images for website ${websiteId} on publish...`)

    // Get website data
    const { data: website } = await supabase
      .from('websites')
      .select('theme')
      .eq('id', websiteId)
      .single()

    if (!website) {
      throw new Error('Website not found')
    }

    // Save logo if exists
    if (website.theme?.logo) {
      try {
        const logoPath = generateImagePath({
          userId,
          websiteId,
          type: 'logo',
        })

        const permanentLogoUrl = await saveImageToStorage({
          imageUrl: website.theme.logo,
          bucket: 'website-images',
          path: logoPath,
          userId,
        })

        if (permanentLogoUrl !== website.theme.logo) {
          await supabase
            .from('websites')
            .update({
              theme: {
                ...website.theme,
                logo: permanentLogoUrl,
              },
            })
            .eq('id', websiteId)
          savedCount++
        }
      } catch (error) {
        errors.push(`Logo: ${error}`)
      }
    }

    // Get all pages and sections
    const { data: pages } = await supabase
      .from('pages')
      .select('id')
      .eq('website_id', websiteId)

    if (!pages) return { success: false, savedCount, errors }

    for (const page of pages) {
      const { data: sections } = await supabase
        .from('sections')
        .select('*')
        .eq('page_id', page.id)

      if (!sections) continue

      for (const section of sections) {
        const content = section.content || {}
        const updatedContent = { ...content }
        let hasChanges = false

        // Save hero/CTA background images
        if ((section.type === 'HERO' || section.type === 'CTA') && content.backgroundImage) {
          try {
            const imagePath = generateImagePath({
              userId,
              websiteId,
              type: section.type === 'HERO' ? 'hero' : 'section',
            })

            const permanentUrl = await saveImageToStorage({
              imageUrl: content.backgroundImage,
              bucket: 'website-images',
              path: imagePath,
              userId,
            })

            if (permanentUrl !== content.backgroundImage) {
              updatedContent.backgroundImage = permanentUrl
              hasChanges = true
              savedCount++
            }
          } catch (error) {
            errors.push(`Section ${section.id} background: ${error}`)
          }
        }

        // Save about section image
        if (section.type === 'ABOUT' && content.image) {
          try {
            const imagePath = generateImagePath({
              userId,
              websiteId,
              type: 'section',
            })

            const permanentUrl = await saveImageToStorage({
              imageUrl: content.image,
              bucket: 'website-images',
              path: imagePath,
              userId,
            })

            if (permanentUrl !== content.image) {
              updatedContent.image = permanentUrl
              hasChanges = true
              savedCount++
            }
          } catch (error) {
            errors.push(`Section ${section.id} image: ${error}`)
          }
        }

        // Save features array images
        if (content.features && Array.isArray(content.features)) {
          updatedContent.features = await Promise.all(
            content.features.map(async (feature: any, idx: number) => {
              if (feature.image) {
                try {
                  const imagePath = generateImagePath({
                    userId,
                    websiteId,
                    type: 'feature',
                    index: idx,
                  })

                  const permanentUrl = await saveImageToStorage({
                    imageUrl: feature.image,
                    bucket: 'website-images',
                    path: imagePath,
                    userId,
                  })

                  if (permanentUrl !== feature.image) {
                    hasChanges = true
                    savedCount++
                    return { ...feature, image: permanentUrl }
                  }
                } catch (error) {
                  errors.push(`Feature ${idx} image: ${error}`)
                }
              }
              return feature
            })
          )
        }

        // Save services array images
        if (content.services && Array.isArray(content.services)) {
          updatedContent.services = await Promise.all(
            content.services.map(async (service: any, idx: number) => {
              if (service.image) {
                try {
                  const imagePath = generateImagePath({
                    userId,
                    websiteId,
                    type: 'service',
                    index: idx,
                  })

                  const permanentUrl = await saveImageToStorage({
                    imageUrl: service.image,
                    bucket: 'website-images',
                    path: imagePath,
                    userId,
                  })

                  if (permanentUrl !== service.image) {
                    hasChanges = true
                    savedCount++
                    return { ...service, image: permanentUrl }
                  }
                } catch (error) {
                  errors.push(`Service ${idx} image: ${error}`)
                }
              }
              return service
            })
          )
        }

        // Update section if there were changes
        if (hasChanges) {
          await supabase
            .from('sections')
            .update({ content: updatedContent })
            .eq('id', section.id)
        }
      }
    }

    // Save product images
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('website_id', websiteId)
      .single()

    if (store) {
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', store.id)

      if (products) {
        for (const product of products) {
          const { data: productImages } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', product.id)

          if (productImages) {
            for (let i = 0; i < productImages.length; i++) {
              const productImage = productImages[i]
              try {
                const imagePath = generateImagePath({
                  userId,
                  websiteId,
                  type: 'product',
                  index: i,
                })

                const permanentUrl = await saveImageToStorage({
                  imageUrl: productImage.url,
                  bucket: 'website-images',
                  path: imagePath,
                  userId,
                })

                if (permanentUrl !== productImage.url) {
                  await supabase
                    .from('product_images')
                    .update({ url: permanentUrl })
                    .eq('id', productImage.id)
                  savedCount++
                }
              } catch (error) {
                errors.push(`Product image ${i}: ${error}`)
              }
            }
          }
        }
      }
    }

    console.log(`Saved ${savedCount} images for website ${websiteId}`)
    return { success: true, savedCount, errors }
  } catch (error) {
    console.error('Error saving website images on publish:', error)
    return { success: false, savedCount, errors: [...errors, `${error}`] }
  }
}

/**
 * Delete an image from storage
 */
export async function deleteImageFromStorage(params: {
  bucket: string
  path: string
}): Promise<boolean> {
  const { bucket, path } = params

  try {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Error deleting image from storage:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting image from storage:', error)
    return false
  }
}
