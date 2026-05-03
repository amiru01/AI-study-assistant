# 🏗️ AI Study Assistant - Architecture Diagram

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Upload Page  │  │  Dashboard   │  │  Study Page  │        │
│  │              │  │              │  │              │        │
│  │ - Select file│  │ - View notes │  │ - Summaries  │        │
│  │ - Upload     │  │ - Click note │  │ - Quizzes    │        │
│  │ - Extract    │  │              │  │ - Flashcards │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND SERVICES                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Storage    │  │   Database   │  │  AI Service  │        │
│  │   Service    │  │   Service    │  │              │        │
│  │              │  │              │  │ - Summary    │        │
│  │ - Upload     │  │ - Save note  │  │ - Quiz       │        │
│  │ - Get URL    │  │ - Get notes  │  │ - Flashcards │        │
│  │ - Delete     │  │ - Save AI    │  │              │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Supabase   │  │   Supabase   │  │  Hugging     │        │
│  │   Storage    │  │   Database   │  │  Face API    │        │
│  │              │  │              │  │              │        │
│  │ - Store PDFs │  │ - notes      │  │ - FREE!      │        │
│  │ - Store imgs │  │ - generated_ │  │ - Summarize  │        │
│  │ - Public URL │  │   content    │  │ - Generate   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 AI Summarization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: UPLOAD FILE                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  User selects    │
                    │  PDF or image    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Extract text    │
                    │  (PDF.js/OCR)    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Upload to       │
                    │  Supabase        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Save metadata   │
                    │  to database     │
                    └────────┬─────────┘
                             │
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 2: GENERATE SUMMARY                     │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  User clicks     │
                    │  "Generate       │
                    │   Summary"       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Get note text   │
                    │  from database   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Call AI Service │
                    │  generateSummary()│
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Send to         │
                    │  Hugging Face    │
                    │  API (FREE)      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Receive         │
                    │  AI summary      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Save summary    │
                    │  to database     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Display in UI   │
                    └──────────────────┘
```

---

## 📁 File Structure

```
AI Study Assistant/
│
├── public/
│   ├── upload.html              # Upload page UI
│   ├── dashboard-refactored.html # Dashboard UI
│   └── study.html               # Study page UI (AI features)
│
├── src/
│   ├── pages/
│   │   ├── upload-page.js       # Upload logic
│   │   ├── dashboard-page.js    # Dashboard logic
│   │   └── study-page.js        # ⭐ AI features logic
│   │
│   ├── services/
│   │   ├── aiService.js         # ⭐ AI orchestration
│   │   ├── freeAiService.js     # ⭐ Hugging Face implementation
│   │   ├── supabaseStorageService.js    # File storage
│   │   ├── supabaseDatabaseService.js   # Database operations
│   │   └── supabaseAuthService.js       # Authentication
│   │
│   ├── config/
│   │   ├── api.js               # ⭐ API keys & endpoints
│   │   └── supabase.js          # Supabase config
│   │
│   ├── utils/
│   │   ├── validation.js        # Input validation
│   │   └── formatting.js        # Data formatting
│   │
│   └── components/
│       ├── toast.js             # Toast notifications
│       └── loader.js            # Loading indicators
│
└── Documentation/
    ├── AI-SUMMARIZATION-GUIDE.md    # Complete guide
    ├── AI-QUICK-SETUP.md            # Quick setup
    └── AI-ARCHITECTURE-DIAGRAM.md   # This file
```

---

## 🔌 API Integration

### Hugging Face API (FREE)

```javascript
// Endpoint
https://api-inference.huggingface.co/models/facebook/bart-large-cnn

// Request
POST /models/facebook/bart-large-cnn
Headers:
  Authorization: Bearer hf_xxxxxxxxxxxxx
  Content-Type: application/json
Body:
  {
    "inputs": "Text to summarize...",
    "parameters": {
      "max_length": 200,
      "min_length": 50
    }
  }

// Response
[
  {
    "summary_text": "Generated summary..."
  }
]
```

### Supabase Database

```javascript
// Save summary
supabase
  .from('generated_content')
  .insert([{
    note_id: 'uuid',
    user_id: 'uuid',
    type: 'summary',
    content: 'Summary text...',
    created_at: '2026-05-03T12:00:00Z'
  }])

// Get summary
supabase
  .from('generated_content')
  .select('*')
  .eq('note_id', noteId)
  .eq('type', 'summary')
  .single()
```

---

## 🎯 Data Flow

### Upload Flow

```
User → File Input → Validation → Text Extraction → Storage Upload
                                                          ↓
                                                    Get Public URL
                                                          ↓
                                                    Save to Database
                                                          ↓
                                                    Redirect to Dashboard
```

### Summary Generation Flow

```
User Click → Get Note → Extract Text → AI Service → Hugging Face API
                                                          ↓
                                                    Parse Response
                                                          ↓
                                                    Save to Database
                                                          ↓
                                                    Display in UI
```

### Summary Retrieval Flow

```
Page Load → Check Database → Summary Exists? 
                                   ↓
                            Yes ←──┴──→ No
                             ↓           ↓
                      Display Summary   Show "Generate" Button
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Layer 1: Authentication (Supabase Auth)                 │  │
│  │  - User must be logged in                                │  │
│  │  - JWT tokens for API calls                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Layer 2: Row Level Security (RLS)                       │  │
│  │  - Users can only access their own notes                 │  │
│  │  - Users can only see their own summaries                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Layer 3: API Key Protection                             │  │
│  │  - API keys stored in config (not exposed)               │  │
│  │  - Rate limiting on AI requests                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Layer 4: Input Validation                               │  │
│  │  - Validate file types and sizes                         │  │
│  │  - Sanitize text input                                   │  │
│  │  - Check text length limits                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

```sql
-- Notes table (stores uploaded files)
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  file_name TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  extracted_text TEXT,  -- ⭐ Used for AI processing
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Generated content table (stores AI outputs)
CREATE TABLE generated_content (
  id UUID PRIMARY KEY,
  note_id UUID REFERENCES notes(id),
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('summary', 'quiz', 'flashcards')),
  content JSONB,  -- ⭐ Stores AI-generated content
  created_at TIMESTAMPTZ
);
```

---

## 🚀 Performance Optimization

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      CACHING LAYERS                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Level 1: Database Cache                                 │  │
│  │  - Summaries saved in generated_content table            │  │
│  │  - No need to regenerate if exists                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Level 2: Browser Cache                                  │  │
│  │  - Extracted text stored in note object                  │  │
│  │  - No need to re-extract on page load                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Level 3: API Response Cache                             │  │
│  │  - Hugging Face caches model responses                   │  │
│  │  - Faster subsequent requests                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      UI STATES                                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Initial    │  │   Loading    │  │   Success    │        │
│  │              │  │              │  │              │        │
│  │ - Show       │  │ - Disable    │  │ - Display    │        │
│  │   button     │  │   button     │  │   summary    │        │
│  │ - Empty      │  │ - Show       │  │ - Enable     │        │
│  │   content    │  │   spinner    │  │   actions    │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
│         │    Click         │    Success       │                 │
│         └─────────►────────┴─────────►────────┘                │
│                            │                                    │
│                            │ Error                              │
│                            ▼                                    │
│                   ┌──────────────┐                             │
│                   │    Error     │                             │
│                   │              │                             │
│                   │ - Show error │                             │
│                   │ - Enable     │                             │
│                   │   retry      │                             │
│                   └──────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary

### Your System Has:

✅ **3-Layer Architecture**
   - Frontend (UI)
   - Services (Business Logic)
   - Backend (APIs & Database)

✅ **Complete AI Pipeline**
   - Text extraction
   - AI processing
   - Database storage
   - UI display

✅ **Security**
   - Authentication
   - RLS policies
   - Input validation
   - API key protection

✅ **Performance**
   - Database caching
   - Browser caching
   - Efficient API calls

✅ **User Experience**
   - Loading states
   - Error handling
   - Toast notifications
   - Responsive design

### Everything is Ready!

Just add your Hugging Face token and start using FREE AI! 🚀
