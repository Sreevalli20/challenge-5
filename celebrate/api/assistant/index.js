const { GoogleGenAI } = require('@google/genai');

// Helper for intelligent contextual fallback calculation
function generateIntelligentAdvisory(prompt, type, eventContext) {
  const budget = Number(eventContext?.totalBudget) || 10000;
  const spent = Number(eventContext?.spentBudget) || 0;
  const remaining = budget - spent;
  const guests = Number(eventContext?.guestCount) || 50;
  const costPerGuest = guests > 0 ? Math.round(budget / guests) : 0;
  const eventName = eventContext?.title || 'your celebration';
  const eventCategory = eventContext?.category || 'Celebration';
  const eventDate = eventContext?.date || 'the scheduled date';
  const eventLocation = eventContext?.location || 'the venue';

  if (type === 'budget_breakdown') {
    return `### Recommended Budget Allocation for ${eventName}
*Based on total budget of **$${budget.toLocaleString()}** for **${guests} guests** (~$${costPerGuest}/guest)*

- **Catering & Bar (40-45%)**: **$${Math.round(budget * 0.42).toLocaleString()}** — Plated dinner or stations, passed hors d'oeuvres, bar package, service staff, and tableware.
- **Venue & Rental (20-25%)**: **$${Math.round(budget * 0.22).toLocaleString()}** — Venue hire, custodial deposit, chairs, linens, and lounge furniture.
- **Photography & Videography (10-12%)**: **$${Math.round(budget * 0.11).toLocaleString()}** — 6-8 hours coverage, edited digital gallery, and drone footage.
- **Decor, Floral & Lighting (8-10%)**: **$${Math.round(budget * 0.09).toLocaleString()}** — Focal arch, table centerpieces, ambient uplighting, and signage.
- **Entertainment & Music (8-10%)**: **$${Math.round(budget * 0.08).toLocaleString()}** — DJ or live music ensemble, wireless mics, and sound engineering.
- **Contingency Reserve (5-8%)**: **$${Math.round(budget * 0.08).toLocaleString()}** — Buffer for overtime, vendor gratuities, and unexpected additions.

💡 **Financial Health Check**: You have **$${spent.toLocaleString()}** committed with **$${remaining.toLocaleString()}** remaining in your reserve.`;
  }

  if (type === 'run_of_show') {
    return `### Master Run of Show: ${eventName}
*Coordinated timeline designed for a seamless ${eventCategory.toLowerCase()} celebration*

- **T-3:00 Hours — Vendor Load-In & Audio Check**
  - Venue access open. Sound technicians complete acoustic check.
  - Florists stage centerpieces and entrance installations.
  - Caterers prep plating stations, bar glassware, and ice stock.

- **T-0:30 Hours — Ambient Walkthrough**
  - Ambient music begins. Entrance candles lit.
  - Host and event coordinator conduct final 5-minute sync.

- **00:00 — Guest Arrival & Welcome Reception**
  - Welcome champagne & non-alcoholic spritzers served.
  - Passed canapés and guest registry check-in open.

- **01:15 — Welcome Address & Opening Ceremony**
  - Host or MC takes the floor, welcomes attendees, and toasts the occasion.

- **01:45 — Dinner Service & Culinary Stations**
  - Main course service begins. Background acoustic playlist.

- **03:00 — Speeches, Toasts & Special Tributes**
  - Key milestone speeches or video slideshow presentation (target 15-20 min max).

- **03:30 — Dance Floor Opens & Evening Revelry**
  - High-energy playlist, dessert bar, and interactive photo booth live.

- **05:00 — Grand Finale & Send-Off**
  - Last call for the bar 30 minutes prior. Fond farewells and attendee gifts.
  - Vendor strike and packdown begins.`;
  }

  if (type === 'invitation_copy') {
    return `### Curated Invitation Wordings for ${eventName}

#### Option 1: Warm & Celebratory
> **Celebrate with Us!**  
> We invite you to share in the joy and milestone moments of **${eventName}**.  
> **Date**: ${eventDate}  
> **Location**: ${eventLocation}  
> Join us for an evening of wonderful food, uplifting music, and cherished company.  
> *Kindly RSVP online so we may reserve your seat.*

#### Option 2: Elegant & Formal
> **The Honor of Your Presence is Requested**  
> Please join us to celebrate:  
> **${eventName}**  
> On ${eventDate} at ${eventLocation}  
> Cocktail reception followed by dinner and dancing.  
> *Dress Code: Semi-Formal / Black Tie Optional.*

#### Option 3: Contemporary & Upbeat
> **Save the Date — We're Celebrating!**  
> Mark your calendar for **${eventName}**!  
> When: ${eventDate}  
> Where: ${eventLocation}  
> Great drinks, incredible music, and unforgettable memories await.`;
  }

  if (type === 'catering_portions') {
    const wineBottles = Math.ceil((guests * 3) / 5);
    const beerCases = Math.ceil((guests * 2) / 24);
    const appetizers = guests * 5;
    return `### Catering & Bar Estimator for ${guests} Guests
*Portion guidelines calibrated for a 4-5 hour ${eventCategory.toLowerCase()}*

- **Passed Appetizers**: Plan for **~${appetizers} pieces total** (~5-6 pieces per guest for cocktail hour, or 10-12 if replacing dinner).
- **Wine & Champagne**: **~${wineBottles} bottles** (~3 glasses per guest, standard 750ml bottle yields 5 glasses). Recommend 60% red/white, 40% sparkling.
- **Beer & Seltzers**: **~${beerCases} cases** (approx. 2 drinks per guest across the evening).
- **Non-Alcoholic & Mixers**: Plan for 1 liter of sparkling water or artisanal mocktail per 2 guests.
- **Dinner Mains**: Standard allocation is 6-8 oz protein per guest with 4 oz starch and 4 oz vegetables.

💡 *Pro-tip*: Always request 5% buffer from your caterer to accommodate unexpected last-minute guests or dietary substitutions.`;
  }

  if (type === 'vendor_questions') {
    return `### Critical Vendor Interview Checklist for ${eventName}

#### For Caterers:
1. Is staffing (bartenders, busing, kitchen prep) included in the quote or billed hourly?
2. What is the deadline for the final headcount cutoff before penalizing charges?
3. How are severe allergies (celiac, peanut, shellfish) isolated in your preparation line?
4. Are cake cutting, corkage, or clean-up fees included or charged separately?

#### For Venues:
1. What is the strict sound curfew and load-out end time for the facility?
2. Are tables, chairs, and security personnel included in the rental price?
3. What liability insurance coverage or vendor permits are required prior to load-in?
4. Is there dedicated freight elevator access and staging space for the catering truck?

#### For Photographers & Entertainers:
1. What is the turnaround time for sneak peek photos and the complete high-res gallery?
2. Does the DJ provide their own wireless microphones for host speeches and ceremony?
3. What is the overtime rate if the celebration runs 30 minutes past schedule?`;
  }

  // General questions response
  return `### Event Consultation for ${eventName}

Regarding your inquiry: *"**${prompt}**"*

**Key Operational Directives for your ${eventCategory.toLowerCase()}**:
1. **Capacity & Flow**: With **${guests} guests** expected at **${eventLocation}**, prioritize a wide entrance lane to avoid arrival bottlenecking at coat check or the welcome drink table.
2. **Budget Status**: You have committed **$${spent.toLocaleString()}** out of **$${budget.toLocaleString()}** total budget. Keep the remaining **$${remaining.toLocaleString()}** protected for final week vendor overtime buffers and last-minute tips.
3. **Execution Milestone**: Finalize your vendor schedule and run of show by **${eventDate}**, and ensure each lead vendor has the cell phone number of your on-site coordinator.`;
}

module.exports = async (req, res) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // CORS - allow all origins for development, should be restricted in production
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://celebrate-pink-chi.vercel.app'])
    : ['*'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, eventContext, type } = req.body;

    // Input validation
    if (!prompt && !type) {
      return res.status(400).json({ error: 'Prompt or prompt type is required' });
    }

    // Sanitize input to prevent injection
    if (prompt && typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt format' });
    }
    if (prompt && prompt.length > 5000) {
      return res.status(400).json({ error: 'Prompt too long (max 5000 characters)' });
    }

    if (type && typeof type !== 'string') {
      return res.status(400).json({ error: 'Invalid type format' });
    }

    // Construct comprehensive contextual prompt
    const eventDetails = eventContext
      ? `
Current Event Context:
- Title: ${eventContext.title || 'Untitled Event'}
- Category: ${eventContext.category || 'General Celebration'}
- Date: ${eventContext.date || 'TBD'}
- Location: ${eventContext.location || 'TBD'}
- Guest Count: ${eventContext.guestCount || 0} guests
- Total Budget: $${eventContext.totalBudget || 0}
- Spent Budget: $${eventContext.spentBudget || 0}
- Remaining Budget: $${(eventContext.totalBudget || 0) - (eventContext.spentBudget || 0)}
- Confirmed RSVPs: ${eventContext.confirmedGuests || 0}
- Pending RSVPs: ${eventContext.pendingGuests || 0}
- Incomplete Tasks: ${eventContext.incompleteTasks || 0}
`
      : 'No specific event selected. Operating in general event planning mode.';

    // Initialize Google GenAI client if API key is present
    const apiKey = process.env.GEMINI_API_KEY;
    let aiClient = null;
    if (apiKey) {
      try {
        aiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.error('Failed to initialize GoogleGenAI client:', err);
      }
    }

    // If live AI client is available, attempt Gemini with a strict timeout
    if (aiClient && apiKey) {
      try {
        const systemInstruction = `You are the CELEBRATE Intelligent Event Assistant, an expert senior event planner and hospitality director.
Provide realistic, highly practical, actionable advice, schedules, vendor questions, or draft copy tailored to the user's specific event.
Ground all advice strictly in the provided event context (budget, guest count, days remaining).
Format your response with clean markdown headings, bulleted lists, and concise paragraphs.
Do not use fake code identifiers or filler words. Be warm, structured, and genuinely helpful.`;

        const geminiPromise = aiClient.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `${eventDetails}\n\nUser Request: ${prompt}\n\nTask Intent: ${type || 'general_consultation'}`,
          config: {
            systemInstruction,
          },
        });

        // 10-second timeout race
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI response timed out')), 10000)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]);
        const responseText = response.text || 'No response generated.';

        return res.status(200).json({
          success: true,
          response: responseText,
          source: 'gemini-2.0-flash',
        });
      } catch (error) {
        console.warn('Gemini API call timed out or failed; falling back to CELEBRATE rules engine:', error.message);
        // Fallback gracefully below
      }
    }

    // Fallback to CELEBRATE Intelligent Rules Engine
    const advisory = generateIntelligentAdvisory(prompt || '', type, eventContext);
    return res.status(200).json({
      success: true,
      response: advisory,
      source: 'celebrate-algorithmic-engine',
      notice: 'Grounded in CELEBRATE Intelligent Event Knowledge Base',
    });
  } catch (error) {
    console.error('Assistant API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
