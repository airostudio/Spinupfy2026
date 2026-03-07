# Extras & Add-ons System Architecture

## Overview

The Extras & Add-ons system allows users to install pre-built features (booking systems, ticket sales, forms, etc.) into their AI-generated websites. Each extra is business-type aware, payment-ready, and guided by an intelligent wizard.

---

## Complete Extras Catalog

### 1. BOOKING CATEGORY

#### 1.1 Accommodation Booking System
**Best for**: Hotels, B&Bs, vacation rentals, hostels
**Price**: $29/month + 2.5% transaction fee
**Features**:
- Real-time availability calendar
- Multiple room types & seasonal pricing
- Instant booking confirmation
- Guest portal & reviews
- Stripe payments
- Cancellation policies
- Min/max night stays
- Analytics dashboard

**Stripe Connect**: Required

---

#### 1.2 Table Reservation System
**Best for**: Restaurants, cafés, bars
**Price**: Free (optional deposit system)
**Features**:
- Real-time table availability
- Time slot management
- Party size customization
- Special dietary requests
- SMS & email confirmations
- Floor plan visualization
- Wait list management
- No-show protection (optional deposits via Stripe)

**Stripe Connect**: Optional (for deposits)

---

#### 1.3 Appointment Scheduling
**Best for**: Salons, spas, medical, dental, consulting, legal
**Price**: Free
**Features**:
- Multiple staff/provider scheduling
- Service duration customization
- Buffer time management
- Email & SMS reminders
- Recurring appointments
- Client history tracking
- Google Calendar sync
- Timezone handling
- Waitlist for cancellations

**Stripe Connect**: Not required

---

#### 1.4 Class & Workshop Booking
**Best for**: Fitness studios, yoga, dance, art classes
**Price**: $19/month
**Features**:
- Recurring class schedules
- Drop-in vs. package purchases
- Class capacity limits
- Instructor assignments
- Waitlist management
- Package/membership management
- Attendance tracking
- Student progress tracking

**Stripe Connect**: Required

---

#### 1.5 Tour & Experience Booking
**Best for**: Tour operators, travel agencies, activity providers
**Price**: $24/month + 3% transaction fee
**Features**:
- Multiple tour schedules
- Group size limits
- Multi-language support
- Equipment rental add-ons
- Weather-based cancellations
- Photo package upsells
- Guide assignment
- Review collection

**Stripe Connect**: Required

---

### 2. ECOMMERCE CATEGORY

#### 2.1 Ticket Sales & Event Registration
**Best for**: Musicians, event planners, theaters, sports venues
**Price**: $19/month + 3.5% transaction fee
**Features**:
- Multiple ticket tiers (GA, VIP, Early Bird)
- Group discounts
- QR code generation
- Mobile ticket delivery
- Check-in app
- Waitlist for sold-out events
- Refund management
- Real-time sales dashboard
- Seating chart (optional)

**Stripe Connect**: Required

---

#### 2.2 Membership & Subscription Management
**Best for**: Gyms, clubs, coworking spaces, content creators
**Price**: $29/month + 2% transaction fee
**Features**:
- Recurring billing (monthly, annual)
- Multiple membership tiers
- Member portal & directory
- Access control & check-ins
- Automated renewals
- Trial periods
- Family/corporate plans
- Member benefits tracking

**Stripe Connect**: Required

---

#### 2.3 Digital Product Sales
**Best for**: Creators, educators, consultants
**Price**: $14/month + 2.5% transaction fee
**Features**:
- Digital downloads (PDFs, videos, audio)
- License key generation
- Download tracking & limits
- File hosting & delivery
- Product bundles
- Upsell & cross-sell
- Discount codes
- Customer library portal

**Stripe Connect**: Required

---

#### 2.4 Physical Product Store
**Best for**: E-commerce, retail, merchandise
**Price**: $39/month + 2.9% transaction fee
**Features**:
- Product catalog
- Inventory management
- Shipping calculator
- Order management
- Customer accounts
- Abandoned cart recovery
- Product variants (size, color)
- Bulk discounts

**Stripe Connect**: Required

---

#### 2.5 Donation & Fundraising
**Best for**: Non-profits, charities, causes
**Price**: Free (platform fees apply)
**Features**:
- One-time & recurring donations
- Campaign goals & progress bars
- Donor wall & recognition
- Tax receipt generation
- Peer-to-peer fundraising
- Memorial/honor donations
- Impact reporting
- Donor portal

**Stripe Connect**: Required

---

### 3. SCHEDULING CATEGORY

#### 3.1 Event Calendar
**Best for**: All business types
**Price**: Free
**Features**:
- Public event calendar
- Multiple calendar views (month, week, day, list)
- Event categories & filtering
- RSVP tracking
- Calendar export (iCal, Google)
- Recurring events
- Event reminders
- Timezone support

**Stripe Connect**: Not required

---

#### 3.2 Staff Scheduling & Shifts
**Best for**: Restaurants, retail, hospitality
**Price**: $29/month
**Features**:
- Shift planning & assignment
- Staff availability tracking
- Time-off requests
- Shift swapping
- Labor cost tracking
- Break scheduling
- Overtime alerts
- Mobile app for staff

**Stripe Connect**: Not required

---

### 4. ENGAGEMENT CATEGORY

#### 4.1 Contact Forms & Lead Capture
**Best for**: All business types
**Price**: Free
**Features**:
- Custom form builder
- Multi-step forms
- Conditional logic
- File uploads
- Spam protection
- Auto-responders
- Email notifications
- Lead export (CSV)
- CRM integration

**Stripe Connect**: Not required

---

#### 4.2 Quote Request System
**Best for**: Contractors, service providers, B2B
**Price**: Free
**Features**:
- Custom quote forms
- Budget range selection
- Project scope builder
- File attachments
- Quote tracking & follow-up
- Approval workflow
- Quote expiration
- Conversion tracking

**Stripe Connect**: Not required

---

#### 4.3 Survey & Feedback Forms
**Best for**: All business types
**Price**: Free
**Features**:
- Multiple question types
- Rating scales
- Logic branching
- Anonymous responses
- Results analytics
- Export responses
- Custom thank-you pages
- Email notifications

**Stripe Connect**: Not required

---

#### 4.4 Calculators & Tools
**Best for**: Finance, real estate, legal, contractors
**Price**: Free
**Features**:
- Loan calculator
- Mortgage calculator
- ROI calculator
- Pricing calculator
- BMI calculator
- Custom formula builder
- Results export
- Lead capture integration

**Stripe Connect**: Not required

---

#### 4.5 Quiz Builder
**Best for**: Education, marketing, entertainment
**Price**: $9/month
**Features**:
- Multiple choice & true/false
- Personality quizzes
- Scored quizzes
- Results pages
- Lead capture
- Social sharing
- Analytics & insights
- Email automation

**Stripe Connect**: Not required

---

### 5. MEDIA CATEGORY

#### 5.1 Video Gallery & Player
**Best for**: Videographers, entertainers, education
**Price**: $14/month
**Features**:
- Video upload & hosting
- Playlist creation
- Video player customization
- Chapters & timestamps
- Password protection
- Download controls
- Analytics (views, engagement)
- Subtitle support

**Stripe Connect**: Not required

---

#### 5.2 Photo Gallery & Portfolios
**Best for**: Photographers, artists, designers
**Price**: Free
**Features**:
- Masonry, grid, slider layouts
- Lightbox viewing
- Image optimization
- Watermarking
- Client galleries (password-protected)
- Download options
- Print ordering integration
- EXIF data display

**Stripe Connect**: Optional (for print sales)

---

#### 5.3 Audio Player & Podcast
**Best for**: Musicians, podcasters, educators
**Price**: $9/month
**Features**:
- Audio player widgets
- Playlist management
- RSS feed generation
- Streaming optimization
- Download options
- Episode show notes
- Subscription tracking
- Analytics

**Stripe Connect**: Not required

---

### 6. COMMUNITY CATEGORY

#### 6.1 Testimonial & Review System
**Best for**: All business types
**Price**: Free
**Features**:
- Review submission forms
- Star ratings
- Photo/video reviews
- Moderation dashboard
- Auto-publish or manual approval
- Review widgets
- Schema markup for SEO
- Review request automation

**Stripe Connect**: Not required

---

#### 6.2 Blog & News
**Best for**: All business types
**Price**: Free
**Features**:
- Blog post editor
- Categories & tags
- Featured images
- Author profiles
- Comments (optional)
- RSS feed
- Social sharing
- SEO optimization

**Stripe Connect**: Not required

---

#### 6.3 Forum & Community
**Best for**: Education, membership sites, support
**Price**: $39/month
**Features**:
- Discussion threads
- User profiles & reputation
- Moderation tools
- Categories & subcategories
- Search & filtering
- Notifications
- Private messaging
- Member directory

**Stripe Connect**: Not required

---

#### 6.4 Chat & Live Support
**Best for**: Service businesses, e-commerce
**Price**: $19/month
**Features**:
- Live chat widget
- Canned responses
- Chat transcripts
- Visitor tracking
- Offline messages
- Chat routing to team
- Mobile apps
- Integration with Slack/email

**Stripe Connect**: Not required

---

### 7. ANALYTICS CATEGORY

#### 7.1 Advanced Analytics Dashboard
**Best for**: All business types
**Price**: $19/month
**Features**:
- Visitor tracking
- Conversion funnels
- Goal tracking
- Heatmaps
- Session recordings
- A/B testing
- Custom reports
- Export data

**Stripe Connect**: Not required

---

#### 7.2 Email Marketing Integration
**Best for**: All business types
**Price**: Free (sync only)
**Features**:
- Newsletter signup forms
- Mailchimp integration
- ConvertKit integration
- Automated welcome emails
- Subscriber management
- List segmentation
- Campaign analytics
- Popup forms

**Stripe Connect**: Not required

---

## System Architecture

### Database Schema

```sql
-- Installed extras
CREATE TABLE installed_extras (
  id UUID PRIMARY KEY,
  website_id UUID REFERENCES websites(id),
  extra_id VARCHAR NOT NULL, -- Reference to catalog
  section_id UUID REFERENCES sections(id) NULLABLE,

  status VARCHAR NOT NULL, -- draft, configuring, active, paused, error

  configuration JSONB NOT NULL,

  stripe_account_id VARCHAR NULLABLE,
  stripe_connected BOOLEAN DEFAULT FALSE,

  installed_at TIMESTAMP NOT NULL,
  activated_at TIMESTAMP NULLABLE,
  last_modified TIMESTAMP NOT NULL,

  usage JSONB, -- Analytics data
  metadata JSONB
);

-- Accommodation bookings
CREATE TABLE accommodation_bookings (
  id UUID PRIMARY KEY,
  extra_id UUID REFERENCES installed_extras(id),

  guest_name VARCHAR NOT NULL,
  guest_email VARCHAR NOT NULL,
  guest_phone VARCHAR,

  room_type_id UUID NOT NULL,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL,

  total_price DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(10,2),

  special_requests TEXT,

  status VARCHAR NOT NULL, -- pending, confirmed, checked_in, checked_out, cancelled

  stripe_payment_intent_id VARCHAR,

  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Table reservations
CREATE TABLE table_reservations (
  id UUID PRIMARY KEY,
  extra_id UUID REFERENCES installed_extras(id),

  guest_name VARCHAR NOT NULL,
  guest_email VARCHAR NOT NULL,
  guest_phone VARCHAR NOT NULL,

  party_size INT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,

  special_requests TEXT,
  dietary_restrictions TEXT,

  status VARCHAR NOT NULL, -- pending, confirmed, seated, completed, cancelled, no_show

  table_number INT,

  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  extra_id UUID REFERENCES installed_extras(id),

  event_id UUID NOT NULL,
  ticket_tier_id UUID NOT NULL,

  buyer_name VARCHAR NOT NULL,
  buyer_email VARCHAR NOT NULL,
  buyer_phone VARCHAR,

  quantity INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,

  qr_code VARCHAR NOT NULL,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP,

  status VARCHAR NOT NULL, -- pending, confirmed, cancelled, refunded

  stripe_payment_intent_id VARCHAR NOT NULL,

  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  extra_id UUID REFERENCES installed_extras(id),

  client_name VARCHAR NOT NULL,
  client_email VARCHAR NOT NULL,
  client_phone VARCHAR NOT NULL,

  service_id UUID NOT NULL,
  staff_id UUID NOT NULL,

  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INT NOT NULL,

  notes TEXT,

  status VARCHAR NOT NULL, -- scheduled, confirmed, completed, cancelled, no_show

  reminder_sent BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

### Stripe Connect Flow

1. **User clicks "Connect Stripe"** in wizard
2. **Redirect to Stripe OAuth**:
   ```
   https://connect.stripe.com/oauth/authorize?
     response_type=code&
     client_id=ca_xxx&
     scope=read_write&
     redirect_uri=https://yoursite.com/stripe/callback
   ```
3. **User authorizes in Stripe**
4. **Stripe redirects back** with auth code
5. **Exchange code for account ID**:
   ```javascript
   const response = await stripe.oauth.token({
     grant_type: 'authorization_code',
     code: authCode,
   });
   const stripeAccountId = response.stripe_user_id;
   ```
6. **Save account ID** to `installed_extras.stripe_account_id`
7. **Set up webhooks** for this account
8. **Mark as connected**: `stripe_connected = true`

### Payment Processing Flow

**For bookings/tickets (one-time payments)**:
```javascript
// Create payment intent on behalf of connected account
const paymentIntent = await stripe.paymentIntents.create({
  amount: totalPrice * 100, // cents
  currency: 'usd',
  application_fee_amount: platformFee * 100,
  transfer_data: {
    destination: installedExtra.stripe_account_id,
  },
}, {
  stripeAccount: installedExtra.stripe_account_id
});
```

**For subscriptions/memberships**:
```javascript
// Create subscription with application fee
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  application_fee_percent: 10, // Platform takes 10%
}, {
  stripeAccount: installedExtra.stripe_account_id
});
```

### Wizard UI Flow

```
┌─────────────────────────────────────┐
│   Editor: User clicks "Add Extra"   │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│  Show Extras Picker Modal           │
│                                     │
│  "What would you like to add?"      │
│                                     │
│  [Recommended for Hotels]           │
│  ▸ Accommodation Booking            │
│  ▸ Contact Form                     │
│  ▸ Event Calendar                   │
│                                     │
│  [All Extras (24)]                  │
│  ├ Booking (5)                      │
│  ├ E-commerce (5)                   │
│  ├ Scheduling (2)                   │
│  └ ...                              │
└────────────┬────────────────────────┘
             │
             v (User selects)
┌─────────────────────────────────────┐
│  Installation Wizard                │
│                                     │
│  Step 1 of 6: Property Info         │
│  [=====>              ] 20%          │
│                                     │
│  Property Name: _______________     │
│  Property Type: [Hotel ▼]           │
│  Address: _______________           │
│                                     │
│  [Back]              [Next →]       │
└────────────┬────────────────────────┘
             │
             v (Complete all steps)
┌─────────────────────────────────────┐
│  Step 4 of 6: Payment Setup         │
│                                     │
│  [Connect with Stripe]              │
│                                     │
│  ✓ Secure payments                  │
│  ✓ Automatic payouts                │
│  ✓ 2.9% + 30¢ per transaction      │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│  Step 6 of 6: Review & Launch       │
│                                     │
│  ✓ Property configured              │
│  ✓ Room types set up                │
│  ✓ Policies defined                 │
│  ✓ Stripe connected                 │
│  ✓ Design customized                │
│                                     │
│  [← Back]        [Activate 🚀]      │
└────────────┬────────────────────────┘
             │
             v
┌─────────────────────────────────────┐
│  Success! 🎉                        │
│                                     │
│  Your booking system is live!       │
│                                     │
│  [View on Website]                  │
│  [Manage Bookings]                  │
│  [Settings]                         │
└─────────────────────────────────────┘
```

### File Structure

```
lib/extras/
├── extras-catalog.ts          # All extras definitions
├── extras-manager.ts          # Installation & lifecycle
├── EXTRAS_SYSTEM_ARCHITECTURE.md
└── extras/
    ├── accommodation-booking/
    │   ├── component.tsx      # React component
    │   ├── schema.ts          # Data model
    │   ├── api.ts            # Backend API
    │   └── emails/           # Email templates
    ├── table-reservation/
    ├── ticket-sales/
    └── ...

components/extras/
├── ExtrasPicker.tsx          # Modal to choose extras
├── ExtrasWizard.tsx          # Multi-step wizard
├── ExtrasManager.tsx         # Dashboard for managing
└── extras/
    ├── AccommodationBooking.tsx
    ├── TableReservation.tsx
    └── ...

app/api/extras/
├── install/route.ts          # POST /api/extras/install
├── configure/route.ts        # POST /api/extras/configure
├── activate/route.ts         # POST /api/extras/activate
├── stripe-connect/route.ts   # Stripe OAuth callback
└── webhooks/route.ts         # Stripe webhooks
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create extras catalog with all definitions
- [ ] Build extras manager (install/configure/activate)
- [ ] Set up database schema
- [ ] Create wizard UI component
- [ ] Build extras picker modal

### Phase 2: Core Extras (Week 3-4)
- [ ] Accommodation booking system
- [ ] Table reservation system
- [ ] Ticket sales system
- [ ] Appointment scheduling
- [ ] Contact forms

### Phase 3: Stripe Integration (Week 5)
- [ ] Stripe Connect OAuth flow
- [ ] Payment processing
- [ ] Webhook handling
- [ ] Payout management
- [ ] Fee calculation

### Phase 4: Additional Extras (Week 6-8)
- [ ] Membership system
- [ ] Digital products
- [ ] Event calendar
- [ ] Calculators
- [ ] Analytics dashboard

### Phase 5: Polish & Launch (Week 9-10)
- [ ] Testing all extras
- [ ] Documentation
- [ ] User guides
- [ ] Support system
- [ ] Launch! 🚀

---

## Business Model

### Platform Fees

**Free Extras** (No payment processing):
- Contact forms, appointment scheduling, event calendar, etc.
- $0/month, $0 transaction fees

**Paid Extras** (With payment processing):
- Platform takes 10-15% of transaction fee
- Example: Stripe charges 2.9% + 30¢, we add 2.5%, user pays 5.4% + 30¢
- Monthly fees ($9-$39) for premium features

**Revenue Streams**:
1. **Transaction fees** (10-15% on all payments)
2. **Monthly subscriptions** ($9-$39/month per extra)
3. **Setup fees** for complex integrations
4. **Premium support** ($99/month)

**Example Revenue**:
- Hotel with 100 bookings/month @ $150 avg = $15,000
- Platform fee (2.5%) = $375/month
- Monthly subscription = $29/month
- Total revenue = $404/month from one customer

---

## Next Steps

1. **Review this architecture** and provide feedback
2. **Prioritize which extras to build first**
3. **Design database schema in detail**
4. **Build wizard UI prototype**
5. **Implement first extra (accommodation booking)**
6. **Test Stripe Connect integration**
7. **Launch beta program**

This system will make the AI Web Creator incredibly powerful and sticky - users won't want to leave once they have bookings/tickets/payments flowing through the platform! 🚀
