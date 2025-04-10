bandroom-admin-frontend/
├── app/
│ ├── courses/
│ │ ├── page.tsx # List Courses
│ │ └── create.tsx # Create New Course
│ ├── lessons/
│ │ ├── page.tsx # List Lessons
│ │ └── [courseId]/page.tsx # Dynamic lessons under course
│ ├── questions/
│ │ └── [lessonId]/page.tsx # Dynamic questions under lesson
│ ├── layout.tsx # App Shell (Navbar, Sidebar)
│ └── page.tsx # Dashboard Home
├── components/
│ ├── CourseForm.tsx
│ ├── LessonForm.tsx
│ ├── QuestionForm.tsx
│ └── Navbar.tsx
├── lib/
│ ├── api.ts # Axios client
├── styles/
│ ├── globals.css
├── public/
│ ├── images/
├── tailwind.config.js
├── package.json
└── next.config.js
