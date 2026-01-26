# Frontend TODO - Implementation Checklist

## Overview
All backend APIs are now implemented and tested. Frontend needs to integrate these endpoints.

---

## 1. Skills Section ✅ READY

### Features to Implement

- [ ] Display list of skills
  - Fetch from `GET /students/profile` (skills array)
  - Show skill name and proficiency level
  - Display with tag/chip component

- [ ] Add New Skill
  - Form inputs: Name, Proficiency (dropdown)
  - POST to `/students/skills`
  - Add to local state on success
  - Show success notification
  - Clear form

- [ ] Edit Skill
  - Modal/form to edit skill
  - PUT to `/students/skills/:skillId`
  - Update local state
  - Show success notification

- [ ] Delete Skill
  - Add delete button/icon to each skill
  - DELETE to `/students/skills/:skillId`
  - Remove from local state
  - Show confirmation dialog

- [ ] Proficiency Levels Dropdown
  ```javascript
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  ```

### API Endpoints
- `GET /students/profile` - Get all skills (in response)
- `POST /students/skills` - Add skill
- `PUT /students/skills/:skillId` - Update skill
- `DELETE /students/skills/:skillId` - Delete skill

### Error Handling
- Handle 400 - Invalid input
- Handle 404 - Skill not found
- Handle 401 - Unauthorized (re-auth)
- Show error toast/modal

---

## 2. Experience Section ✅ READY

### Features to Implement

- [ ] Display list of experiences
  - Fetch from `GET /students/profile` (experiences array)
  - Show: Job Title, Company, Duration (start-end dates)
  - Indicate if currently working (no end date)

- [ ] Add New Experience
  - Form inputs:
    - Company Name (text)
    - Job Title/Position (text)
    - Description (textarea, optional)
    - Start Date (date picker, YYYY-MM-DD)
    - End Date (date picker, optional)
    - Currently Working (checkbox - clears end date)
  - POST to `/students/experiences`
  - Add to local state on success
  - Format dates properly
  - Show success notification

- [ ] Edit Experience
  - Modal/form to edit experience
  - Pre-fill with existing data
  - Handle date formatting (string to date and back)
  - PUT to `/students/experiences/:experienceId`
  - Update local state
  - Show success notification

- [ ] Delete Experience
  - Add delete button/icon
  - DELETE to `/students/experiences/:experienceId`
  - Remove from local state
  - Show confirmation dialog

- [ ] Date Handling
  ```javascript
  // Convert to backend format (YYYY-MM-DD)
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  // Parse from backend
  const parseDate = (dateString) => new Date(dateString);
  ```

### API Endpoints
- `GET /students/profile` - Get all experiences (in response)
- `POST /students/experiences` - Add experience
- `PUT /students/experiences/:experienceId` - Update experience
- `DELETE /students/experiences/:experienceId` - Delete experience

### Error Handling
- Validate dates (start < end)
- Handle 400 - Invalid input
- Handle 404 - Experience not found
- Handle 401 - Unauthorized

---

## 3. Education Section (Future) ⏳

Note: Education endpoints are documented in FRONTEND_IMPLEMENTATION_GUIDE.md
Current implementation status: **Not Yet Implemented on Backend**

When ready, implement:
- `POST /students/education` - Add education
- `PUT /students/education/:educationId` - Update education
- `DELETE /students/education/:educationId` - Delete education

---

## 4. Profile Image Upload ✅ READY

### Features to Implement

- [ ] Image Upload Component
  - File input (accept="image/*")
  - File type validation (png, jpg, jpeg, webp)
  - File size validation (max 5MB)
  - Show file preview before upload
  - Drag & drop support (optional)

- [ ] Upload Process
  1. User selects image
  2. Validate file size and type on frontend
  3. POST to `/upload/image` with FormData
  4. Get `url` from response
  5. Send url in PUT `/students/profile` update
  6. Update profile picture in UI
  7. Show success notification

- [ ] Error Handling
  - Display file size error (max 5MB)
  - Display file type error
  - Display upload error
  - Show loading spinner during upload

- [ ] Integration with Profile
  - Show current profile image
  - Replace placeholder/initials with image
  - Add "Change Photo" button
  - Trigger re-fetch of profile after update

### Code Example
```javascript
async function uploadProfileImage(imageFile, authToken) {
  // Validate file
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
  
  if (imageFile.size > MAX_SIZE) {
    throw new Error('File size must be less than 5MB');
  }
  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    throw new Error('Only PNG, JPEG, WEBP allowed');
  }

  // Upload to get URL
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const uploadRes = await fetch('http://localhost:3000/upload/image', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` },
    body: formData
  });
  
  if (!uploadRes.ok) throw new Error('Upload failed');
  
  const { url } = await uploadRes.json();
  
  // Update profile with image URL
  const profileRes = await fetch('http://localhost:3000/students/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ profileImageUrl: url })
  });
  
  if (!profileRes.ok) throw new Error('Profile update failed');
  
  return url;
}
```

### API Endpoints
- `POST /upload/image` - Upload image (returns URL)
- `PUT /students/profile` - Update profile with image URL

---

## 5. Company Logo Upload ✅ READY

Same as profile image upload but for companies:

- [ ] Upload Company Logo
  - Same file validation as profile image
  - POST to `/upload/image`
  - Save URL to company profile
  - PUT to `/companies/profile` with `logoUrl`
  - Display logo in company profile

### API Endpoints
- `POST /upload/image` - Upload logo image
- `PUT /companies/profile` - Update company profile with logo

---

## 6. State Management

### Suggested State Structure
```javascript
// Profile State
const studentProfile = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  profileImageUrl: 'https://...',
  skills: [
    { skillId: 1, name: 'TypeScript', proficiency: 'Advanced' },
    { skillId: 2, name: 'React', proficiency: 'Intermediate' }
  ],
  experiences: [
    {
      experienceId: 1,
      title: 'Senior Developer',
      company: 'Google',
      description: '...',
      startDate: '2023-01-15',
      endDate: '2024-06-30'
    }
  ]
};
```

### Update Patterns
```javascript
// Add skill
setProfile(prev => ({
  ...prev,
  skills: [...prev.skills, newSkill]
}));

// Update skill
setProfile(prev => ({
  ...prev,
  skills: prev.skills.map(s => 
    s.skillId === id ? updatedSkill : s
  )
}));

// Delete skill
setProfile(prev => ({
  ...prev,
  skills: prev.skills.filter(s => s.skillId !== id)
}));
```

---

## 7. UI/UX Recommendations

### Skills Component
- Tag-based display (like LinkedIn)
- Inline edit/delete buttons
- Empty state: "No skills added yet"
- Add button clearly visible

### Experience Component
- Timeline/chronological display
- Card-based layout
- Show date range (e.g., "Jan 2023 - Jun 2024")
- Show "Currently working here" for open-ended positions
- Expand/collapse descriptions

### Image Upload
- Circular avatar for profile image
- Logo container for company logo
- Upload overlay on hover
- Progress indicator during upload
- Error message overlay

### Forms
- Use date input type for dates
- Validate required fields
- Show loading state on submit
- Disable submit button while loading
- Success toast notification
- Error modal/toast

---

## 8. API Integration Tips

### Fetch Wrapper
```javascript
async function apiCall(method, endpoint, data, token) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const options = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  };

  const response = await fetch(
    `${process.env.REACT_APP_API_URL}${endpoint}`,
    options
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API error');
  }

  return await response.json();
}
```

### Error Handling
```javascript
try {
  await apiCall('POST', '/students/skills', skillData, token);
  showSuccessNotification('Skill added!');
  // Refetch or update state
} catch (error) {
  showErrorNotification(error.message);
  if (error.status === 401) {
    // Redirect to login
  }
}
```

---

## 9. Testing Checklist

Before deployment:

- [ ] Add skill with all proficiency levels
- [ ] Edit skill name and proficiency
- [ ] Delete skill
- [ ] Add experience with full date range
- [ ] Add experience as ongoing (no end date)
- [ ] Edit experience details
- [ ] Delete experience
- [ ] Upload profile image (test file validation)
- [ ] Upload oversized file (should fail with 413)
- [ ] Upload wrong file type (should fail with 415)
- [ ] Upload company logo
- [ ] Refresh page - data persists
- [ ] Error states - network down, 401, 404
- [ ] Concurrent requests - multiple add/edit simultaneously

---

## 10. Documentation Files Available

- **FRONTEND_IMPLEMENTATION_GUIDE.md** - Complete API reference with examples
- **BACKEND_IMPLEMENTATION_COMPLETE.md** - Backend implementation details
- **API_QUICK_REFERENCE.md** - Quick endpoint reference
- **FRONTEND_IMPLEMENTATION_CHECKLIST.md** - This file

---

## 11. Backend Status

✅ **All endpoints implemented and tested**
- Skills CRUD: Fully functional
- Experience CRUD: Fully functional
- Image uploads: Fully functional
- Profile updates: Fully functional

**Test Results**
```
Test Suites: 13 passed
Tests:       127 passed
Coverage:    All CRUD operations tested
```

---

## 12. Next Steps

1. **Review FRONTEND_IMPLEMENTATION_GUIDE.md** - Understand all available endpoints
2. **Set up API client** - Create fetch wrapper/axios instance
3. **Implement Skills component** - Start with CRUD operations
4. **Implement Experience component** - Add date handling
5. **Implement Image upload** - Add file validation
6. **Test all features** - Run manual testing checklist
7. **Deploy** - Push to production

---

## 12. Support Resources

- Swagger API Docs: http://localhost:3000/api
- Database: PostgreSQL (Neon)
- File Storage: Cloudinary
- Authentication: JWT (24h expiration)
- Rate Limit: 60 requests/minute

---

**Backend Ready Date**: January 26, 2026
**Frontend Implementation Status**: Not Started ⏳
**Estimated Frontend Time**: 2-3 days (depending on UI complexity)
