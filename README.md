StyleIQ 👗

AI-powered fashion styling and shopping application built with React Native, Expo, Firebase, Supabase, and Paystack.

StyleIQ is a fashion-focused mobile application designed to help users discover products, manage their personal style preferences, create and save looks, shop for fashion items, and receive AI-assisted styling recommendations.

The project also includes a web-based admin dashboard for managing users, products, orders, and other application operations.

⸻

✨ Features

👤 User Accounts

* User registration and sign-in
* Firebase Authentication
* User profile management
* Edit profile information
* Profile avatar and user statistics

🎨 Personal Style

* Style preference management
* Favorite colors
* Clothing categories
* Budget preferences
* Personalized style information

🤖 AI Stylist

* AI-powered fashion styling experience
* Style recommendations based on user interaction and preferences

🛍️ Shopping

* Browse fashion products
* Product details
* Product categories
* Product colors and descriptions
* Add products to cart
* Wishlist functionality

👗 Looks & Outfits

* Create looks
* Save outfits
* Manage saved looks
* View personal outfits

📦 Orders

* Checkout
* Order creation
* Order history
* Order details
* Delivery status
* Payment status

💳 Payments

* Paystack payment integration
* NGN currency support
* Payment status tracking

🔔 Notifications

* In-app notification functionality
* Notification management

⚙️ Settings

* Appearance/theme settings
* Privacy & security
* Delivery addresses
* Payment methods
* Help & support
* Terms and conditions

⸻
STYLEIQ SCREENSHOT IMAGES.


![Home Screen](https://github.com/ogumsamuel/StyleIQ/blob/9303ccdbaf84f4e132bf9baa08223fa0560a1c7b/Home.jpeg)

![Product Details](https://github.com/ogumsamuel/StyleIQ/blob/0243d3f6d389f2a4312478cb742af2b93c0d5372/Product%20Details.jpeg)

![StyleIQ Cart](https://github.com/ogumsamuel/StyleIQ/blob/93f1d456d245611cadff652ed779a8c9f4a0d361/Cart.jpeg)

![Admin Dashboard](https://github.com/ogumsamuel/StyleIQ/blob/c6d3a508be5b6d04e0db18c0532b4ff1d44d10df/Admin%20Dashboard.jpeg)

![Orders](https://github.com/ogumsamuel/StyleIQ/blob/56bdcf4af51eea91bc809312b7640ed23e5bc7d0/Orders.jpeg)

![Paymen Method](https://github.com/ogumsamuel/StyleIQ/blob/5532ab25bcf83d9dc77690be0f847332f6507846/Payment%20method.jpeg)



🖥️ Admin Dashboard

StyleIQ includes a dedicated web-based admin dashboard used as the management interface for the application.

The dashboard provides functionality for:

* User management
* Product management
* Product image management
* Order management
* Delivery status updates
* Payment status updates
* AI Stylist administration

⸻

🏗️ Architecture

StyleIQ uses separate services for authentication, application data, product images, payments, and administration.

                         ┌──────────────────────┐
                         │      StyleIQ App     │
                         │   React Native/Expo  │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
             Firebase Auth      Firestore       Paystack
             Authentication     Database        Payments
                    │               │
                    │               │
                    │               ▼
                    │        Product Metadata
                    │        User Data
                    │        Orders
                    │        Wishlists
                    │
                    ▼
                  Users
              ┌─────────────────────────┐
              │     Admin Dashboard     │
              │      React + Vite       │
              └────────────┬────────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
             Supabase           Firestore
              Storage            Database
                  │                 │
                  ▼                 ▼
           Product Images     Product Metadata

Data Responsibilities

Service	Purpose
React Native + Expo	Mobile application
React + Vite	Admin dashboard
Firebase Authentication	User authentication
Firebase Firestore	Application and product data
Supabase Storage	Product image storage
Paystack	Payment processing
Node.js + Express	Backend/API functionality

⸻

🛠️ Tech Stack

Mobile Application

* React Native
* Expo
* TypeScript
* Expo Router
* React Navigation

Backend

* Node.js
* Express
* Firebase Admin SDK

Database & Authentication

* Firebase Authentication
* Firebase Firestore

Storage

* Supabase Storage

Payments

* Paystack
* react-native-paystack-webview

Admin Dashboard

* React
* TypeScript
* Vite

Development

* Git
* GitHub
* ESLint

⸻

📁 Project Structure

StyleIQ/
│
├── app/                    # Expo Router application screens
│
├── assets/                 # Application assets
│
├── components/             # Reusable React Native components
│
├── constants/              # Application constants
│
├── hooks/                  # Custom React hooks
│
├── src/
│   ├── data/               # Product data
│   ├── services/           # Firebase and application services
│   └── theme/              # Global theme system
│
├── admin/                  # StyleIQ web admin dashboard
│
├── backend/                # Node.js/Express backend
│
├── firebase-admin/         # Firebase Admin configuration
│
├── scripts/                # Development scripts
│
├── app.json                # Expo configuration
├── package.json            # Mobile application dependencies
└── README.md

⸻

🚀 Getting Started

Prerequisites

Make sure you have installed:

* Node.js
* npm
* Expo CLI / Expo tooling
* Git

Clone the repository

git clone https://github.com/ogumsamuel/StyleIQ.git
cd StyleIQ

Install dependencies

npm install

Start the Expo application

npx expo start

You can then run the application using Expo Go, an Android emulator, an iOS simulator, or a development build.

⸻

🖥️ Running the Admin Dashboard

Navigate to the admin directory:

cd admin

Install dependencies:

npm install

Start the development server:

npm run dev

⸻

🔐 Environment Variables

Sensitive credentials and environment-specific configuration are intentionally excluded from this repository.

Examples include:

.env
firebase-service-account.json

The admin dashboard uses environment variables for services such as Supabase.

Never commit private API keys, service-account credentials, passwords, or other secrets to GitHub.

⸻

🎯 Project Goals

StyleIQ was created to explore the intersection of:

* Fashion
* Artificial intelligence
* Mobile application development
* E-commerce
* Personalized user experiences
* Cloud-based application architecture

The project demonstrates the development of a full-stack application spanning mobile development, backend services, cloud databases, authentication, storage, payments, and administration.

⸻

👨‍💻 Developer

Ogum Samuel

GitHub: @ogumsamuel

⸻

📌 Project Status

StyleIQ is an actively developed project.

New functionality, improvements, bug fixes, and refinements are being added as development continues.

⸻

📄 License

This project is currently for portfolio and demonstration purposes.
