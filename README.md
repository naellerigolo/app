# FitFusion

FitFusion is a self-contained progressive web dashboard that helps athletes and everyday movers plan, track, and analyze their training, nutrition, and habits. The app stores everything locally in your browser so you can experiment instantly without setting up a backend.

## Features

- **Dynamic dashboard** that summarizes weekly training volume, calories, and upcoming priorities.
- **Workout planner & log** for capturing duration, intensity, calories, and notes for every session.
- **Nutrition tracking** with macro breakdowns and calorie totals.
- **Goal and habit builder** to structure training blocks, lifestyle habits, and reflections.
- **Analytics hub** with interactive charts for body metrics, macro distribution, and training splits, powered by Chart.js.
- **Weekly schedule board** to map training and recovery with quick edits.
- **Local persistence** using `localStorage`, seeded with sample data so you can see everything in action immediately.

## Getting started

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox, or Safari).
2. Log workouts, meals, body metrics, goals, and habits using the forms provided.
3. Revisit the dashboard or analytics tabs to visualize progress and insights.

No build process is required; the site is pure HTML, CSS, and JavaScript.

## Testing

Because FitFusion is a static client-side application, validation is primarily manual:

1. Open `index.html` directly in your browser.
2. Confirm that the dashboard summary tiles populate with the seeded demo data.
3. Use the **Log Workout**, **Log Meal**, **Add Goal**, and **Add Habit** buttons to open each modal and submit a new entry. Verify the new entries appear in their respective tables and that the dashboard totals update.
4. Switch to the **Analytics** section to ensure charts render and reflect the latest data. If charts do not render, check the browser console for JavaScript errors.
5. Refresh the page to confirm all added data persists via `localStorage`.

Automated tests are not included with this static project; if desired you can add end-to-end coverage with a tool such as Playwright or Cypress.

## Tech stack

- HTML5 & semantic layout
- Modern CSS with responsive design and utility helpers
- Vanilla JavaScript with local storage persistence
- [Chart.js](https://www.chartjs.org/) for data visualization

## Notes

- Data is stored locally per browser. Clearing browser storage will reset the app to its demo state.
- The application is intentionally framework-free so it can be easily extended with any backend or frontend toolchain you prefer.
