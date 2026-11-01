# CELEBRATE — AI Event Planner

An intelligent, personalized event-planning platform that transforms occasion details, budget, guest count, location, and preferences into a complete, actionable event plan.

## Features

- **Smart Event Creation Wizard**: Multi-step form with validation for creating events
- **AI-Powered Planning**: Gemini AI integration for intelligent event recommendations (with deterministic fallback)
- **Dynamic Event Management**: View, edit, update, and delete events with real-time recalculation
- **Intelligent Budget Management**: Track expenses, monitor budget utilization, cost-per-guest calculations
- **Guest Management**: Add guests, track RSVPs, dietary preferences, and special requirements
- **Venue Planning**: Compare venue options with capacity, pricing, and amenity tracking
- **Event Timeline & Tasks**: AI-generated task suggestions with deadline tracking
- **Invitation Studio**: Create customizable invitations with AI-generated text
- **AI Event Assistant**: Contextual conversational assistant for event planning questions
- **Comprehensive Reports**: Event summary with statistics, budget breakdown, and progress tracking

## Supported Event Categories

- Birthday celebrations
- Weddings and engagements
- College festivals and cultural events
- Corporate events
- Anniversary celebrations
- Baby showers
- Graduation celebrations
- Family gatherings
- Community events
- Custom celebrations

## Technology Stack

- **Backend**: FastAPI (Python 3.14.6)
- **Database**: SQLite with SQLAlchemy (async)
- **AI Integration**: Google Gemini API with deterministic fallback
- **Frontend**: Server-rendered Jinja2 templates with vanilla JavaScript
- **Styling**: Custom CSS with responsive design
- **Testing**: pytest with async support

## Project Structure

```
challenge-5/
├── app/
│   ├── api/              # API route handlers
│   │   ├── events.py
│   │   ├── guests.py
│   │   ├── venues.py
│   │   ├── expenses.py
│   │   ├── tasks.py
│   │   ├── invitations.py
│   │   └── assistant.py
│   ├── core/             # Core configuration
│   │   ├── config.py
│   │   ├── security.py
│   │   └── database.py
│   ├── models/           # Database models
│   │   └── event.py
│   ├── services/         # Business logic
│   │   ├── ai_service.py
│   │   └── deterministic_planner.py
│   ├── static/           # Static assets
│   │   ├── css/
│   │   └── js/
│   ├── templates/        # HTML templates
│   └── main.py           # Application entry point
├── tests/                # Automated tests
├── requirements.txt      # Python dependencies
├── .python-version      # Python version specification
├── .env.example         # Environment variables template
├── render.yaml          # Render deployment configuration
└── README.md            # This file
```

## Python Compatibility

This application is designed for Python 3.14.6. The `.python-version` file specifies this version for Render deployment.

All dependencies have been verified for Python 3.14 compatibility:
- fastapi==0.115.0
- uvicorn[standard]==0.32.0
- pydantic==2.9.2
- sqlalchemy==2.0.35
- google-generativeai==0.8.3
- And other supporting packages

## Installation for Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sreevalli20/challenge-5.git
   cd challenge-5
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY (optional)
   ```

5. **Run the application**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

6. **Access the application**:
   Open http://localhost:8000 in your browser

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Gemini API Key (optional - without it, deterministic planning is used)
GEMINI_API_KEY=your_gemini_api_key_here

# Application Secret Key
SECRET_KEY=your_secret_key_here

# Debug Mode (set to False in production)
DEBUG=True
```

### Gemini API Integration

The application uses Google's Gemini AI for intelligent event planning. To enable AI features:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set the `GEMINI_API_KEY` environment variable
3. Restart the application

**Note**: If the API key is not configured, the application uses a deterministic planning engine that provides structured event plans without AI.

## Database

The application uses SQLite for data persistence. The database file (`celebrate.db`) is created automatically on first run.

**Important for Render Deployment**: Render's filesystem is ephemeral. Data will be lost when the service restarts. For production use with persistent storage, consider:
- Using Render's PostgreSQL add-on
- Implementing cloud storage integration
- Regular database backups

## Testing

Run the automated test suite:

```bash
pytest tests/ -v
```

The test suite includes:
- Event creation, update, and deletion
- Guest management
- Expense tracking
- Task management
- AI service behavior
- Dashboard statistics

Tests use an in-memory SQLite database and do not require a Gemini API key.

## Render Deployment

### Manual Deployment Steps

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `challenge-5` repository

3. **Configure service**:
   - **Name**: celebrate-event-planner (or your preferred name)
   - **Region**: Select nearest region
   - **Branch**: main
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables**:
   - Add `GEMINI_API_KEY` (optional)
   - Add `SECRET_KEY` (generate a secure random string)
   - Add `PYTHON_VERSION` = `3.14.6`

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for build and deployment to complete
   - Access your application at the provided URL

### Render Configuration

The `render.yaml` file in the repository contains deployment configuration. Render can use this for automatic configuration if you enable it.

### Health Check

The application includes a health check endpoint at `/health` that Render can use to monitor service status.

## Security Considerations

- API keys are stored in environment variables, never in code
- The Gemini API key is used only on the backend
- Input validation is implemented on all API endpoints
- SQL injection protection via SQLAlchemy ORM
- XSS protection via Jinja2 auto-escaping
- CORS is configured (adjust for production domains)

**Important**: Never commit `.env` files or API keys to the repository.

## Limitations

1. **Data Persistence**: On Render's free tier, the SQLite database is ephemeral. Data is lost on service restart. For persistent storage, upgrade to a paid database or use PostgreSQL.

2. **AI Rate Limits**: Gemini API has rate limits. The application implements retry logic but may be throttled under heavy use.

3. **Single User**: The current implementation does not include authentication. All events are shared. For multi-user support, authentication would need to be implemented.

4. **No Real Vendor Integration**: Venue and expense tracking is manual. The application does not integrate with real booking systems or payment processors.

## Future Enhancements

Potential improvements for production use:
- User authentication and multi-tenant data isolation
- PostgreSQL database for persistent storage
- Real vendor booking integrations
- Payment processing for expense tracking
- Email integration for invitations
- Calendar export functionality
- Mobile app companion
- Advanced analytics and reporting

## License

This project is created for the Challenge 5 competition.

## Support

For issues or questions:
- Check the README for common solutions
- Review environment variable configuration
- Ensure Python 3.14.6 compatibility
- Verify all dependencies are installed

## Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [Render](https://render.com/) - Cloud deployment platform
