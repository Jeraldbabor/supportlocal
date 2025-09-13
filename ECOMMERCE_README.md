# ArtisanLocal E-commerce Frontend

A modern, simple e-commerce frontend for local artisan craftsmen built with React, Inertia.js, and Tailwind CSS.

## Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **Clean Navigation**: Simple header with Home, Products, About, Contact, and Cart links
- **Product Showcase**: Beautiful product grid with filtering and sorting capabilities
- **Shopping Cart**: Full cart functionality with quantity adjustments and order summary
- **About Page**: Highlighting local artisans and their craftsmanship
- **Contact Form**: Easy-to-use contact form for customer inquiries
- **Modern UI**: Clean, minimalist design using Tailwind CSS

## Pages Included

### 1. Homepage (`/`)
- Hero section with call-to-action
- Featured products grid
- Features highlighting (handmade, quality, shipping)
- Newsletter signup

### 2. Products Page (`/products`)
- Product grid with filtering by category
- Sorting options (name, price, rating)
- Grid/list view toggle
- Product cards with images, ratings, and prices

### 3. About Page (`/about`)
- Mission statement
- Company values
- Featured artisans showcase
- Company story

### 4. Contact Page (`/contact`)
- Contact form with validation
- Business information (address, phone, hours)
- FAQ section

### 5. Shopping Cart (`/cart`)
- Cart items management
- Quantity adjustments
- Order summary with tax and shipping
- Empty cart state

### 6. Product Detail Page (`/product/{id}`)
- Product image gallery
- Detailed product information
- Add to cart functionality
- Product specifications

## Components

### MainLayout
The main layout component that wraps all pages, providing:
- Responsive navigation header
- Footer with company information
- Shopping cart icon with item count

## Styling

The frontend uses Tailwind CSS for styling with:
- Responsive design principles
- Modern color scheme
- Smooth transitions and hover effects
- Mobile-first approach

## Customization

The code is intentionally simple and well-commented for easy customization:

1. **Colors**: Update the primary color in your Tailwind config
2. **Content**: Replace sample content with real data
3. **Images**: Replace placeholder images with actual product photos
4. **Branding**: Update the logo and company name throughout

## Getting Started

1. Make sure your Laravel application is running
2. Install frontend dependencies: `npm install`
3. Build assets: `npm run build` or `npm run dev` for development
4. Visit the homepage to see the e-commerce frontend

## File Structure

```
resources/js/
├── layouts/
│   └── MainLayout.tsx       # Main layout wrapper
├── pages/
│   ├── Home.tsx            # Homepage
│   ├── Products.tsx        # Products listing
│   ├── ProductDetail.tsx   # Individual product page
│   ├── About.tsx           # About page
│   ├── Contact.tsx         # Contact page
│   └── Cart.tsx           # Shopping cart
└── app.tsx                # Main app entry point
```

## Next Steps

To connect this frontend to a backend:

1. Create Laravel controllers for each route
2. Add product models and database migrations
3. Implement cart state management (consider using React Context or Zustand)
4. Add user authentication for checkout
5. Integrate payment processing
6. Add product search functionality
7. Implement order management

## Sample Data

The components include sample data for demonstration purposes. In a real application, this data would come from your Laravel backend via Inertia.js props.

## Browser Support

This frontend supports all modern browsers including:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

The frontend is designed to be simple, modern, and easy to understand while providing a solid foundation for an artisan marketplace e-commerce site.