import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Schema
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  date: { type: Date, default: Date.now },
  category: { type: String, default: 'General' }
});

const News = mongoose.model('News', newsSchema);

// API Routes
app.get('/api/news', async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 }).limit(10);
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/news', async (req, res) => {
  try {
    const news = new News(req.body);
    await news.save();
    res.status(201).json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Health check for Render
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Pre-load sample news if database is empty
    const existingNews = await News.countDocuments();
    if (existingNews === 0) {
      console.log('📝 Adding sample news...');
      const sampleNews = [
        {
          title: '🎓 Wollega University Launches Ultra Edition',
          summary: 'Our new modern platform features real-time updates and responsive design.',
          category: 'Announcement'
        },
        {
          title: '🔬 New AI Research Center Opens',
          summary: 'State-of-the-art facility to drive technological innovation in Ethiopia.',
          category: 'Research'
        },
        {
          title: '🏆 Ranked Top 5 Universities in Ethiopia',
          summary: 'Recognized for academic excellence and research output.',
          category: 'Achievement'
        },
        {
          title: '🌍 International Exchange Program 2026',
          summary: 'Apply now for semester abroad opportunities in Europe and Asia.',
          category: 'Opportunity'
        },
        {
          title: '💻 Free Digital Skills Bootcamp',
          summary: 'Learn web development and data science. Limited spots available!',
          category: 'Event'
        }
      ];
      await News.insertMany(sampleNews);
      console.log(`✅ Added ${sampleNews.length} sample articles`);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });
