# **App Name**: FarmIt-ZM

## Core Features:

- User Authentication: Secure user login and registration with email/password using Firebase Authentication, ensuring only authenticated users can access the app's features.
- Crop and Animal Education: Provide structured, step-by-step lessons on crop and animal production. Users will navigate categorized content with visual aids for an offline-friendly learning experience.
- Crop Tracking: Enable users to track planting dates, growth stages, fertilizer, and pesticide use, and expected harvest dates, offering a dashboard view of the data. Data is isolated per-user on the Firestore database.
- Animal Tracking: Enable users to maintain records of animal feeding, health status, vaccinations, and growth metrics, providing a dashboard view of the collected data. Data is isolated per-user on the Firestore database. Includes a dedicated animal tracking page to show Google Maps of where animals are in real time, and geofencing: if an animal exceeds a certain boundary, it should be flagged
- AI Growth Recommendations: Generate smart, tailored suggestions based on the current crop type and growth stage, delivered through a simple chatbot interface. It is intended as a tool to support optimal farming practices.
- Smart Reminders: Automate reminders for critical tasks, including feeding schedules, vaccinations, and planting or harvesting dates. This will help maintain the farm operations at optimal productivity. Data is isolated per-user on the Firestore database.
- Firestore Integration: Seamlessly integrate with Firestore for real-time data storage, offline persistence, and automatic data synchronization, isolating each user's farm data securely.

## Style Guidelines:

- Primary color: Forest green (#388E3C), drawing from the greenery and plant life on a farm.
- Background color: Light beige (#F5F5DC), similar to sandy soil, setting a neutral scene for productive learning and labor.
- Accent color: Terracotta (#E07A5F), a dark but desaturated accent that takes inspiration from earthworks and pottery.
- Body and headline font: 'PT Sans' (sans-serif) will provide a modern yet accessible feel, ensuring readability for a wide range of users.
- Use agriculture-themed icons, such as crops, animals, and farm tools, for easy navigation. These should follow a simple, clear style.
- Implement a clear, user-friendly layout with a bottom navigation bar for the four main sections. Utilize expandable sections for detailed content.
- Subtle animations should confirm user interactions. For example, animated transitions between steps or feedback animations for tracking updates.