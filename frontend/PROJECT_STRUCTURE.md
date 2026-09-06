**TODO Project structure of this 'Melo' frontend with Tanstack-Start**

```text
frontend/
├── src/
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── index.tsx
│   │   │   └── $listingId.tsx
│   │   │
│   │   ├── sell.tsx
│   │   ├── favorites.tsx
│   │   │
│   │   ├── messages/
│   │   │   ├── index.tsx
│   │   │   └── $conversationId.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── index.tsx
│   │   │   ├── listings.tsx
│   │   │   └── settings.tsx
│   │   │
│   │   └── users/
│   │       └── $userId.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── listings/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ListingForm.tsx
│   │   │   └── FilterSidebar.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   └── MessageBubble.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx
│   │       ├── Loading.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useListings.ts
│   │   ├── useFavorites.ts
│   │   └── useMessages.ts
│   │
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── listings.ts
│   │   ├── categories.ts
│   │   ├── favorites.ts
│   │   ├── users.ts
│   │   └── messages.ts
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── listing.ts
│   │   ├── category.ts
│   │   ├── message.ts
│   │   └── api.ts
│   │
│   ├── lib/
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── router.tsx
│   └── main.tsx
│
├── public/
│   └── ...
│
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```
