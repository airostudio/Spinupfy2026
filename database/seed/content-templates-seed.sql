-- Seed data for content templates (40+ use cases inspired by Rytr.me)
-- System templates available to all users

-- Blog Content Templates
INSERT INTO content_templates (name, description, category, use_case, template_structure, is_system) VALUES
('Blog Post Idea & Outline', 'Generate engaging blog post ideas with detailed outlines', 'blog', 'blog_idea_outline',
'{"fields": ["topic", "target_audience", "keywords"], "output": ["title", "outline", "key_points"]}', true),

('Blog Section Writing', 'Write compelling blog sections or full posts', 'blog', 'blog_section',
'{"fields": ["topic", "section_title", "tone", "word_count"], "output": ["content"]}', true),

('Blog Introduction', 'Create engaging blog post introductions that hook readers', 'blog', 'blog_intro',
'{"fields": ["topic", "main_points", "hook_style"], "output": ["introduction"]}', true),

('Blog Conclusion', 'Write compelling blog conclusions with clear CTAs', 'blog', 'blog_conclusion',
'{"fields": ["topic", "main_points", "cta"], "output": ["conclusion"]}', true),

('SEO Meta Description', 'Generate SEO-optimized meta descriptions', 'blog', 'seo_meta',
'{"fields": ["page_content", "keywords", "max_chars"], "output": ["meta_description", "title_tag"]}', true);

-- Email Templates
INSERT INTO content_templates (name, description, category, use_case, template_structure, is_system) VALUES
('Email Subject Lines', 'Create attention-grabbing email subject lines', 'email', 'email_subject',
'{"fields": ["email_purpose", "tone", "urgency"], "output": ["subject_lines"]}', true),

('Cold Email', 'Write personalized cold outreach emails', 'email', 'cold_email',
'{"fields": ["recipient_role", "value_proposition", "cta"], "output": ["email_body"]}', true),

('Follow-Up Email', 'Create effective follow-up emails', 'email', 'follow_up',
'{"fields": ["previous_interaction", "purpose", "tone"], "output": ["email_body"]}', true),

('Welcome Email', 'Write engaging welcome emails for new subscribers', 'email', 'welcome_email',
'{"fields": ["brand_name", "benefits", "next_steps"], "output": ["email_body"]}', true),

('Newsletter', 'Create engaging newsletter content', 'email', 'newsletter',
'{"fields": ["topics", "tone", "sections"], "output": ["newsletter_content"]}', true);

-- Social Media Templates
INSERT INTO content_templates (name, description, category, use_case, template_structure, is_system) VALUES
('Social Media Post', 'Generate engaging social media posts', 'social', 'social_post',
'{"fields": ["platform", "topic", "tone", "hashtags"], "output": ["post_text"]}', true),

('Instagram Caption', 'Write captivating Instagram captions', 'social', 'instagram_caption',
'{"fields": ["image_description", "brand_voice", "cta"], "output": ["caption", "hashtags"]}', true),

('Twitter/X Thread', 'Create engaging Twitter/X threads', 'social', 'twitter_thread',
'{"fields": ["topic", "main_points", "thread_length"], "output": ["thread_tweets"]}', true),

('LinkedIn Post', 'Write professional LinkedIn posts', 'social', 'linkedin_post',
'{"fields": ["topic", "industry", "call_to_action"], "output": ["post_content"]}', true),

('Facebook Ad Copy', 'Create compelling Facebook ad copy', 'social', 'facebook_ad',
'{"fields": ["product", "target_audience", "offer"], "output": ["headline", "primary_text", "cta"]}', true);

-- Advertising Templates
INSERT INTO content_templates (name, description, category, use_case, template_structure, is_system) VALUES
('Google Ad Copy', 'Write effective Google Ads copy', 'ads', 'google_ad',
'{"fields": ["product", "keywords", "usp"], "output": ["headlines", "descriptions"]}', true),

('Product Description', 'Create compelling product descriptions', 'ads', 'product_description',
'{"fields": ["product_name", "features", "benefits"], "output": ["description"]}', true),

('Landing Page Copy', 'Write high-converting landing page copy', 'ads', 'landing_page',
'{"fields": ["offer", "target_audience", "benefits"], "output": ["headline", "subheadline", "body", "cta"]}', true),

('PPC Ad Copy', 'Generate pay-per-click ad copy', 'ads', 'ppc_ad',
'{"fields": ["product", "keywords", "competition"], "output": ["ad_copy"]}', true);

-- Business Writing Templates
INSERT INTO content_templates (name, description, category, use_case, template_structure, is_system) VALUES
('Business Proposal', 'Write professional business proposals', 'business', 'proposal',
'{"fields": ["client_name", "solution", "benefits", "pricing"], "output": ["proposal_content"]}', true),

('Job Description', 'Create detailed job descriptions', 'business', 'job_description',
'{"fields": ["position", "requirements", "responsibilities"], "output": ["job_post"]}', true),

('Press Release', 'Write newsworthy press releases', 'business', 'press_release',
'{"fields": ["announcement", "company", "quotes"], "output": ["press_release"]}', true),

('Case Study', 'Create compelling case studies', 'business', 'case_study',
'{"fields": ["client", "problem", "solution", "results"], "output": ["case_study"]}', true),

('White Paper', 'Write authoritative white papers', 'business', 'white_paper',
'{"fields": ["topic", "research", "target_audience"], "output": ["white_paper_content"]}', true);

-- Creative Writing Templates
INSERT INTO content_templates (name, description, category, use_case, template_structure, is_system) VALUES
('Story Plot', 'Generate creative story plots and outlines', 'creative', 'story_plot',
'{"fields": ["genre", "characters", "setting"], "output": ["plot_outline"]}', true),

('Character Description', 'Create detailed character descriptions', 'creative', 'character',
'{"fields": ["character_role", "personality", "background"], "output": ["character_profile"]}', true),

('Song Lyrics', 'Write creative song lyrics', 'creative', 'song_lyrics',
'{"fields": ["theme", "genre", "mood"], "output": ["lyrics"]}', true),

('Poetry', 'Generate poems in various styles', 'creative', 'poetry',
'{"fields": ["theme", "style", "length"], "output": ["poem"]}', true);

-- Website Content Templates
INSERT INTO content_templates (name, description, category, use_case, template_structure, is_system) VALUES
('About Us Page', 'Write compelling About Us page content', 'website', 'about_us',
'{"fields": ["company_name", "mission", "history"], "output": ["about_content"]}', true),

('FAQ', 'Generate comprehensive FAQ sections', 'website', 'faq',
'{"fields": ["topic", "common_questions"], "output": ["faq_list"]}', true),

('Terms & Conditions', 'Create legal terms and conditions', 'website', 'terms',
'{"fields": ["business_type", "services", "jurisdiction"], "output": ["terms_content"]}', true),

('Privacy Policy', 'Write comprehensive privacy policies', 'website', 'privacy_policy',
'{"fields": ["data_collected", "usage", "compliance"], "output": ["policy_content"]}', true);

-- Video & Media Templates
INSERT INTO content_templates (name, description, category, use_case, template_structure, is_system) VALUES
('YouTube Video Description', 'Create SEO-optimized YouTube descriptions', 'media', 'youtube_description',
'{"fields": ["video_topic", "keywords", "links"], "output": ["description"]}', true),

('Video Script', 'Write engaging video scripts', 'media', 'video_script',
'{"fields": ["topic", "duration", "target_audience"], "output": ["script"]}', true),

('Podcast Episode Description', 'Generate podcast episode descriptions', 'media', 'podcast_description',
'{"fields": ["episode_topic", "guests", "key_points"], "output": ["description"]}', true);

-- E-commerce Templates
INSERT INTO content_templates (name, description, category, use_case, template_structure, is_system) VALUES
('Product Review', 'Write authentic product reviews', 'ecommerce', 'product_review',
'{"fields": ["product", "pros", "cons", "rating"], "output": ["review"]}', true),

('Product Comparison', 'Create detailed product comparisons', 'ecommerce', 'comparison',
'{"fields": ["products", "criteria", "recommendation"], "output": ["comparison_content"]}', true),

('Shopping Guide', 'Write helpful buying guides', 'ecommerce', 'buying_guide',
'{"fields": ["product_category", "factors", "recommendations"], "output": ["guide_content"]}', true);

-- Professional Communication Templates
INSERT INTO content_templates (name, description, category, use_case, template_structure, is_system) VALUES
('Meeting Agenda', 'Create structured meeting agendas', 'professional', 'meeting_agenda',
'{"fields": ["meeting_purpose", "attendees", "topics"], "output": ["agenda"]}', true),

('Meeting Notes', 'Generate organized meeting notes', 'professional', 'meeting_notes',
'{"fields": ["discussion_points", "decisions", "action_items"], "output": ["notes"]}', true),

('Professional Bio', 'Write compelling professional biographies', 'professional', 'bio',
'{"fields": ["name", "profession", "achievements", "tone"], "output": ["biography"]}', true),

('Recommendation Letter', 'Create strong recommendation letters', 'professional', 'recommendation',
'{"fields": ["candidate_name", "relationship", "strengths"], "output": ["letter"]}', true);
