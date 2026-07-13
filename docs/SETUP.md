# Setup Guide - Archive.Rec

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WawaTer-exe/Archive.Rec.git
   cd Archive.Rec
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run db:init
   ```
   This creates `database/archive.db` with all necessary tables.

4. **Create directories for uploads and submissions**
   ```bash
   mkdir -p images/uploads
   mkdir -p images/submissions
   ```

5. **Create .env file** (optional)
   ```
   PORT=5000
   ```

## Running the Application

### Backend API
```bash
npm run dev
```
The API will be available at `http://localhost:5000`

## Admin Authentication

All admin endpoints require the header: `X-Admin-Password: RecGoblinguONLY`

### Testing the API

**Get all items:**
```bash
curl http://localhost:5000/api/items
```

**Create a new item (admin only):**
```bash
curl -X POST http://localhost:5000/api/items \
  -H "Content-Type: application/json" \
  -H "X-Admin-Password: RecGoblinguONLY" \
  -d '{
    "name": "Portal Gun",
    "description": "Iconic Rec Room item",
    "category": "Weapon",
    "rarity": "Rare",
    "release_date": "2016-06-30"
  }'
```

## Photo Submission System

### Submit a Photo (Public)
```bash
curl -X POST http://localhost:5000/api/submissions/upload \
  -F "file=@path/to/image.jpg" \
  -F "submitted_by=YourName" \
  -F "tags=rec-room,item" \
  -F "description=Description of the photo" \
  -F "associated_item=item-id-here"
```

### View Pending Submissions (Admin Only)
```bash
curl -H "X-Admin-Password: RecGoblinguONLY" \
  http://localhost:5000/api/submissions/pending
```

### Approve a Submission (Admin Only)
```bash
curl -X POST http://localhost:5000/api/submissions/{submission-id}/approve \
  -H "Content-Type: application/json" \
  -H "X-Admin-Password: RecGoblinguONLY" \
  -d '{"approved_by": "admin"}'
```

### Reject a Submission (Admin Only)
```bash
curl -X POST http://localhost:5000/api/submissions/{submission-id}/reject \
  -H "Content-Type: application/json" \
  -H "X-Admin-Password: RecGoblinguONLY" \
  -d '{"reason": "Duplicate photo", "approved_by": "admin"}'
```

## Database Schema

The database contains the following tables:

- **items** - Collectibles and in-game objects
- **maps** - Game levels and environments
- **rooms** - User-created spaces
- **game_history** - Historical events
- **media** - Approved images and media files
- **photo_submissions** - Pending/approved/rejected user submissions
- **item_media**, **map_media**, **room_media** - Relationships

See `database/schema.sql` for detailed schema.

## Next Steps

- Build a React frontend with admin dashboard
- Implement photo search functionality
- Add user authentication for submission tracking
- Create image optimization pipeline
