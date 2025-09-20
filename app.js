const STORAGE_KEY = 'fitfusion-data-v1';
const clone = (value) =>
  typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;

const DEFAULT_STATE = {
  profile: {
    name: 'Guest',
    goal: 'Build healthy habits',
    weight: 72,
  },
  workouts: [
    {
      id: uuid(),
      date: offsetDate(-2),
      type: 'Strength - Upper Body',
      duration: 55,
      calories: 450,
      intensity: 'High',
      notes: 'Bench press 4x6 @ 80kg, pull-ups, overhead press.'
    },
    {
      id: uuid(),
      date: offsetDate(-1),
      type: 'Tempo Run',
      duration: 40,
      calories: 380,
      intensity: 'Moderate',
      notes: '5km negative split. Felt strong.'
    },
    {
      id: uuid(),
      date: offsetDate(0),
      type: 'Mobility + Core',
      duration: 30,
      calories: 180,
      intensity: 'Low',
      notes: 'Full-body mobility flow and planks.'
    }
  ],
  meals: [
    {
      id: uuid(),
      date: offsetDate(0),
      meal: 'Breakfast Bowl',
      calories: 520,
      protein: 35,
      carbs: 55,
      fats: 18
    },
    {
      id: uuid(),
      date: offsetDate(0),
      meal: 'Post-Workout Shake',
      calories: 280,
      protein: 32,
      carbs: 30,
      fats: 6
    },
    {
      id: uuid(),
      date: offsetDate(-1),
      meal: 'Dinner - Salmon & Quinoa',
      calories: 620,
      protein: 45,
      carbs: 50,
      fats: 22
    }
  ],
  goals: [
    {
      id: uuid(),
      title: 'Run a sub 25-minute 5K',
      category: 'Performance',
      due: offsetDate(30),
      progress: 55,
      notes: '3x runs weekly, include tempo and interval work.'
    },
    {
      id: uuid(),
      title: 'Meditate 5 minutes daily',
      category: 'Mindset',
      due: offsetDate(14),
      progress: 70,
      notes: 'Stack habit after morning coffee.'
    }
  ],
  habits: [
    {
      id: uuid(),
      name: 'Hydrate (3L)',
      frequency: 'Daily',
      notes: 'Carry water bottle everywhere.',
      completed: false
    },
    {
      id: uuid(),
      name: 'Lights out before 11pm',
      frequency: 'Daily',
      notes: 'No screens 30 mins before bed.',
      completed: true
    }
  ],
  metrics: [
    {
      id: uuid(),
      date: offsetDate(-10),
      weight: 72.5,
      bodyFat: 18.2,
      muscle: 36.8
    },
    {
      id: uuid(),
      date: offsetDate(-3),
      weight: 72,
      bodyFat: 17.9,
      muscle: 37
    },
    {
      id: uuid(),
      date: offsetDate(0),
      weight: 71.7,
      bodyFat: 17.5,
      muscle: 37.2
    }
  ],
  schedule: {
    Monday: 'Strength - Lower Body\nMobility 10 min',
    Tuesday: 'Tempo Run\nCore accessory work',
    Wednesday: 'Active Recovery\nYoga session',
    Thursday: 'Strength - Upper Body\nInterval bike sprints',
    Friday: 'Easy Run + Technique Drills',
    Saturday: 'Long Run\nContrast shower',
    Sunday: 'Rest & Reflect\nMeal prep'
  },
  reflection: '',
};

let state = loadState();
let metricsChart;
let macroChart;
let trainingChart;

const navButtons = document.querySelectorAll('.app-nav button');
const views = document.querySelectorAll('.view');
const scheduleContainer = document.getElementById('schedule');
const habitList = document.getElementById('habit-list');
const goalList = document.getElementById('goal-list');
const workoutTable = document.getElementById('workout-table');
const nutritionTable = document.getElementById('nutrition-table');
const goalTable = document.getElementById('goal-table');
const insightsList = document.getElementById('insights');
const reflectionInput = document.getElementById('reflection');
const reflectionStatus = document.getElementById('reflection-status');

const profileNameEl = document.getElementById('profile-name');
const profileGoalEl = document.getElementById('profile-goal');

const workoutForm = document.getElementById('workout-form');
const nutritionForm = document.getElementById('nutrition-form');
const goalForm = document.getElementById('goal-form');
const profileForm = document.getElementById('profile-form');
const habitForm = document.getElementById('habit-form');
const metricForm = document.getElementById('metric-form');

const profileDialog = document.getElementById('profile-dialog');
const habitDialog = document.getElementById('habit-dialog');
const metricDialog = document.getElementById('metric-dialog');

const today = new Date().toISOString().slice(0, 10);
document.getElementById('workout-date').value = today;
document.getElementById('meal-date').value = today;

initNavigation();
renderAll();
setupInteractions();

function offsetDate(delta) {
  const date = new Date();
  date.setDate(date.getDate() + delta);
  return date.toISOString().slice(0, 10);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return {
      ...clone(DEFAULT_STATE),
      ...parsed,
      workouts: parsed.workouts?.map(normalizeEntry) ?? [],
      meals: parsed.meals?.map(normalizeEntry) ?? [],
      goals: parsed.goals ?? [],
      habits: parsed.habits ?? [],
      metrics: parsed.metrics?.map(normalizeEntry) ?? [],
      schedule: parsed.schedule ?? clone(DEFAULT_STATE.schedule),
      profile: { ...DEFAULT_STATE.profile, ...parsed.profile },
    };
  } catch (error) {
    console.error('Failed to load state', error);
    return clone(DEFAULT_STATE);
  }
}

function normalizeEntry(entry) {
  return {
    ...entry,
    id: entry.id ?? uuid(),
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateState(updater) {
  updater(state);
  saveState();
  renderAll();
}

function initNavigation() {
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      navButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.target;
      views.forEach((view) => {
        view.classList.toggle('active', view.id === target);
      });
    });
  });
}

function setupInteractions() {
  document.getElementById('edit-profile').addEventListener('click', () => {
    profileForm.querySelector('#profile-name-input').value = state.profile.name || '';
    profileForm.querySelector('#profile-goal-input').value = state.profile.goal || '';
    profileForm.querySelector('#profile-weight-input').value = state.profile.weight || '';
    profileDialog.showModal();
  });

  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(profileForm);
    updateState((draft) => {
      draft.profile.name = formData.get('profile-name-input') || '';
      draft.profile.goal = formData.get('profile-goal-input') || '';
      draft.profile.weight = parseFloat(formData.get('profile-weight-input')) || null;
    });
    profileDialog.close();
  });

  profileDialog.addEventListener('cancel', () => profileDialog.close());

  document.getElementById('add-habit').addEventListener('click', () => {
    habitForm.reset();
    habitDialog.showModal();
  });

  habitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(habitForm);
    const habit = {
      id: uuid(),
      name: formData.get('habit-name'),
      frequency: formData.get('habit-frequency'),
      notes: formData.get('habit-notes') || '',
      completed: false,
    };
    updateState((draft) => {
      draft.habits.push(habit);
    });
    habitDialog.close();
  });

  habitDialog.addEventListener('cancel', () => habitDialog.close());

  document.getElementById('quick-add-goal').addEventListener('click', () => {
    document.querySelector('[data-target="goals"]').click();
    document.getElementById('goal-title').focus();
  });

  document.getElementById('add-metric').addEventListener('click', () => {
    metricForm.reset();
    metricForm.querySelector('#metric-date').value = today;
    metricDialog.showModal();
  });

  metricForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(metricForm);
    const metric = {
      id: uuid(),
      date: formData.get('metric-date'),
      weight: parseFloat(formData.get('metric-weight')),
      bodyFat: parseFloat(formData.get('metric-bodyfat')) || null,
      muscle: parseFloat(formData.get('metric-muscle')) || null,
    };
    updateState((draft) => {
      draft.metrics.push(metric);
    });
    metricDialog.close();
  });

  metricDialog.addEventListener('cancel', () => metricDialog.close());

  document.getElementById('clear-schedule').addEventListener('click', () => {
    if (!confirm('Clear the weekly planner?')) return;
    updateState((draft) => {
      Object.keys(draft.schedule).forEach((day) => {
        draft.schedule[day] = '';
      });
    });
  });

  workoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(workoutForm);
    const workout = {
      id: uuid(),
      date: formData.get('workout-date'),
      type: formData.get('workout-type'),
      duration: Number(formData.get('workout-duration')),
      calories: Number(formData.get('workout-calories')),
      intensity: formData.get('workout-intensity'),
      notes: formData.get('workout-notes') || '',
    };
    updateState((draft) => {
      draft.workouts.push(workout);
    });
    workoutForm.reset();
    document.getElementById('workout-date').value = today;
  });

  nutritionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(nutritionForm);
    const meal = {
      id: uuid(),
      date: formData.get('meal-date'),
      meal: formData.get('meal-type'),
      calories: Number(formData.get('meal-calories')),
      protein: Number(formData.get('meal-protein')),
      carbs: Number(formData.get('meal-carbs')),
      fats: Number(formData.get('meal-fats')),
    };
    updateState((draft) => {
      draft.meals.push(meal);
    });
    nutritionForm.reset();
    document.getElementById('meal-date').value = today;
  });

  goalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(goalForm);
    const goal = {
      id: uuid(),
      title: formData.get('goal-title'),
      category: formData.get('goal-category'),
      due: formData.get('goal-due') || null,
      progress: Number(formData.get('goal-progress')) || 0,
      notes: formData.get('goal-notes') || '',
    };
    updateState((draft) => {
      draft.goals.push(goal);
    });
    goalForm.reset();
  });

  document.getElementById('save-reflection').addEventListener('click', () => {
    updateState((draft) => {
      draft.reflection = reflectionInput.value.trim();
    });
    reflectionStatus.textContent = 'Reflection saved!';
    setTimeout(() => (reflectionStatus.textContent = ''), 2500);
  });
}

function renderAll() {
  updateProfileUI();
  renderStats();
  renderSchedule();
  renderHabits();
  renderGoalsPreview();
  renderWorkouts();
  renderNutrition();
  renderGoalsTable();
  renderReflection();
  renderCharts();
  renderInsights();
}

function updateProfileUI() {
  profileNameEl.textContent = state.profile.name || 'Guest';
  profileGoalEl.textContent = state.profile.goal || 'Build healthy habits';
}

function renderStats() {
  const { workouts, meals } = state;
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const recentWorkouts = workouts.filter((workout) => new Date(workout.date) >= sevenDaysAgo);
  const recentMeals = meals.filter((meal) => new Date(meal.date) >= sevenDaysAgo);

  const workoutCount = recentWorkouts.length;
  const totalMinutes = recentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const caloriesBurned = recentWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const caloriesConsumed = recentMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  document.getElementById('stat-workouts').textContent = workoutCount;
  document.getElementById('stat-minutes').textContent = totalMinutes;
  document.getElementById('stat-calories').textContent = caloriesBurned;
  document.getElementById('stat-calories-in').textContent = caloriesConsumed;
}

function renderSchedule() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  scheduleContainer.innerHTML = '';
  days.forEach((day) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'schedule-day';

    const heading = document.createElement('h4');
    heading.textContent = day;
    wrapper.appendChild(heading);

    const textarea = document.createElement('textarea');
    textarea.value = state.schedule[day] || '';
    textarea.placeholder = 'Plan your training + recovery';
    textarea.addEventListener('change', (event) => {
      const value = event.target.value;
      updateState((draft) => {
        draft.schedule[day] = value;
      });
    });

    wrapper.appendChild(textarea);
    scheduleContainer.appendChild(wrapper);
  });
}

function renderHabits() {
  habitList.innerHTML = '';
  if (!state.habits.length) {
    const empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'No habits yet. Add one to reinforce your goals.';
    habitList.appendChild(empty);
    return;
  }

  state.habits.forEach((habit) => {
    const li = document.createElement('li');
    li.className = 'habit-item';

    const info = document.createElement('div');
    info.className = 'habit-info';

    const title = document.createElement('strong');
    title.textContent = habit.name;
    info.appendChild(title);

    const details = document.createElement('p');
    details.className = 'muted';
    details.textContent = `${habit.frequency}${habit.notes ? ' • ' + habit.notes : ''}`;
    info.appendChild(details);

    const actions = document.createElement('div');
    actions.className = 'habit-actions';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = habit.completed;
    checkbox.addEventListener('change', () => {
      updateState((draft) => {
        const target = draft.habits.find((h) => h.id === habit.id);
        if (target) target.completed = checkbox.checked;
      });
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '✕';
    deleteBtn.title = 'Delete habit';
    deleteBtn.addEventListener('click', () => {
      updateState((draft) => {
        draft.habits = draft.habits.filter((h) => h.id !== habit.id);
      });
    });

    actions.appendChild(checkbox);
    actions.appendChild(deleteBtn);

    li.appendChild(info);
    li.appendChild(actions);
    habitList.appendChild(li);
  });
}

function renderGoalsPreview() {
  goalList.innerHTML = '';
  if (!state.goals.length) {
    const empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'Set a goal to stay focused on what matters most.';
    goalList.appendChild(empty);
    return;
  }

  const upcoming = [...state.goals]
    .filter((goal) => goal.due)
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 3);

  upcoming.forEach((goal) => {
    const li = document.createElement('li');
    li.className = 'goal-item';

    const content = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = goal.title;
    content.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'muted';
    meta.textContent = `${goal.category}${goal.due ? ' • Due ' + formatDate(goal.due) : ''}`;
    content.appendChild(meta);

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = `${goal.progress}%`;

    li.appendChild(content);
    li.appendChild(badge);
    goalList.appendChild(li);
  });

  if (!upcoming.length) {
    const fallback = document.createElement('li');
    fallback.className = 'muted';
    fallback.textContent = 'Keep adding due dates to surface priorities here.';
    goalList.appendChild(fallback);
  }
}

function renderWorkouts() {
  workoutTable.innerHTML = '';
  const sorted = [...state.workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.forEach((workout) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(workout.date)}</td>
      <td>${escapeHtml(workout.type)}</td>
      <td>${workout.duration} min</td>
      <td>${workout.calories}</td>
      <td><span class="badge ${intensityClass(workout.intensity)}">${workout.intensity}</span></td>
      <td>${escapeHtml(workout.notes || '')}</td>
      <td><button class="delete-btn" title="Delete workout">✕</button></td>
    `;
    row.querySelector('.delete-btn').addEventListener('click', () => {
      updateState((draft) => {
        draft.workouts = draft.workouts.filter((w) => w.id !== workout.id);
      });
    });
    workoutTable.appendChild(row);
  });

  if (!sorted.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'muted';
    cell.textContent = 'Log your first workout to start building momentum.';
    row.appendChild(cell);
    workoutTable.appendChild(row);
  }
}

function renderNutrition() {
  nutritionTable.innerHTML = '';
  const sorted = [...state.meals].sort((a, b) => new Date(b.date) - new Date(a.date));
  sorted.forEach((meal) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(meal.date)}</td>
      <td>${escapeHtml(meal.meal)}</td>
      <td>${meal.calories}</td>
      <td>${meal.protein} g</td>
      <td>${meal.carbs} g</td>
      <td>${meal.fats} g</td>
      <td><button class="delete-btn" title="Delete meal">✕</button></td>
    `;
    row.querySelector('.delete-btn').addEventListener('click', () => {
      updateState((draft) => {
        draft.meals = draft.meals.filter((m) => m.id !== meal.id);
      });
    });
    nutritionTable.appendChild(row);
  });

  if (!sorted.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 7;
    cell.className = 'muted';
    cell.textContent = 'Capture your meals to balance energy in vs. out.';
    row.appendChild(cell);
    nutritionTable.appendChild(row);
  }
}

function renderGoalsTable() {
  goalTable.innerHTML = '';
  const sorted = [...state.goals].sort((a, b) => {
    const dateA = a.due ? new Date(a.due) : new Date('2999-12-31');
    const dateB = b.due ? new Date(b.due) : new Date('2999-12-31');
    return dateA - dateB;
  });

  sorted.forEach((goal) => {
    const row = document.createElement('tr');
    const due = goal.due ? formatDate(goal.due) : '—';
    const progress = Math.max(0, Math.min(100, Number(goal.progress) || 0));
    row.innerHTML = `
      <td>${escapeHtml(goal.title)}</td>
      <td>${goal.category}</td>
      <td>${due}</td>
      <td>
        <div class="progress">
          <div class="progress-bar" style="width:${progress}%"></div>
          <span class="progress-label">${progress}%</span>
        </div>
      </td>
      <td>${escapeHtml(goal.notes || '')}</td>
      <td><button class="delete-btn" title="Delete goal">✕</button></td>
    `;
    row.querySelector('.delete-btn').addEventListener('click', () => {
      updateState((draft) => {
        draft.goals = draft.goals.filter((g) => g.id !== goal.id);
      });
    });
    goalTable.appendChild(row);
  });

  if (!sorted.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.className = 'muted';
    cell.textContent = 'Create a goal with an action plan to stay accountable.';
    row.appendChild(cell);
    goalTable.appendChild(row);
  }
}

function renderReflection() {
  reflectionInput.value = state.reflection || '';
}

function renderCharts() {
  const metricsCtx = document.getElementById('metrics-chart').getContext('2d');
  const macroCtx = document.getElementById('macro-chart').getContext('2d');
  const trainingCtx = document.getElementById('training-chart').getContext('2d');

  const metricsData = [...state.metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = metricsData.map((metric) => formatDate(metric.date));
  const weightData = metricsData.map((metric) => metric.weight);
  const bodyFatData = metricsData.map((metric) => metric.bodyFat);

  if (!metricsChart) {
    metricsChart = new Chart(metricsCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Weight (kg)',
            data: weightData,
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.2)',
            tension: 0.3,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Body Fat (%)',
            data: bodyFatData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            tension: 0.3,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            position: 'left',
            ticks: { color: '#1f2937' }
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '#10b981' }
          }
        }
      }
    });
  } else {
    metricsChart.data.labels = labels;
    metricsChart.data.datasets[0].data = weightData;
    metricsChart.data.datasets[1].data = bodyFatData;
    metricsChart.update();
  }

  const macroTotals = aggregateMacros(state.meals);
  const macroData = [macroTotals.protein, macroTotals.carbs, macroTotals.fats];

  if (!macroChart) {
    macroChart = new Chart(macroCtx, {
      type: 'doughnut',
      data: {
        labels: ['Protein', 'Carbs', 'Fats'],
        datasets: [
          {
            data: macroData,
            backgroundColor: ['#6366f1', '#14b8a6', '#f59e0b'],
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  } else {
    macroChart.data.datasets[0].data = macroData;
    macroChart.update();
  }

  const trainingSplit = aggregateTrainingSplit(state.workouts);

  if (!trainingChart) {
    trainingChart = new Chart(trainingCtx, {
      type: 'bar',
      data: {
        labels: trainingSplit.labels,
        datasets: [
          {
            label: 'Sessions',
            data: trainingSplit.data,
            backgroundColor: '#818cf8',
            borderRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          }
        }
      }
    });
  } else {
    trainingChart.data.labels = trainingSplit.labels;
    trainingChart.data.datasets[0].data = trainingSplit.data;
    trainingChart.update();
  }
}

function renderInsights() {
  insightsList.innerHTML = '';
  const insights = buildInsights();
  insights.forEach((text) => {
    const item = document.createElement('li');
    item.className = 'insight-item';
    item.textContent = text;
    insightsList.appendChild(item);
  });

  if (!insights.length) {
    const empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'Add workouts, meals, and metrics to unlock personalized insights.';
    insightsList.appendChild(empty);
  }
}

function buildInsights() {
  const insights = [];
  if (state.workouts.length) {
    const lastSeven = filterRecent(state.workouts, 7);
    const avgDuration = average(lastSeven.map((w) => w.duration));
    if (avgDuration) {
      insights.push(`Average session duration this week: ${Math.round(avgDuration)} minutes. Keep stacking quality work!`);
    }

    const highIntensity = lastSeven.filter((w) => w.intensity === 'High').length;
    if (highIntensity >= 2) {
      insights.push('You hit at least two high-intensity sessions this week. Prioritize mobility or recovery work tomorrow.');
    }
  }

  if (state.meals.length) {
    const macros = aggregateMacros(filterRecent(state.meals, 3));
    const total = macros.protein + macros.carbs + macros.fats;
    if (total > 0) {
      const proteinShare = (macros.protein / total) * 100;
      if (proteinShare < 25) {
        insights.push('Protein intake is under 25% of total macros in the last three days. Consider adding lean protein to meals.');
      } else {
        insights.push('Great job keeping protein above 25% of your macros this week. Recovery loves consistent protein!');
      }
    }
  }

  if (state.metrics.length >= 2) {
    const sorted = [...state.metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
    const last = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    const deltaWeight = last.weight - previous.weight;
    if (Math.abs(deltaWeight) >= 0.2) {
      const direction = deltaWeight > 0 ? 'up' : 'down';
      insights.push(`Body weight is trending ${direction} by ${deltaWeight.toFixed(1)}kg since last check-in.`);
    }
    if (last.bodyFat && previous.bodyFat) {
      const deltaFat = last.bodyFat - previous.bodyFat;
      if (Math.abs(deltaFat) >= 0.3) {
        const direction = deltaFat > 0 ? 'up' : 'down';
        insights.push(`Body fat moved ${direction} ${Math.abs(deltaFat).toFixed(1)}% since last check-in.`);
      }
    }
  }

  return insights;
}

function renderReflectionStatus(message) {
  reflectionStatus.textContent = message;
}

function aggregateMacros(meals) {
  return meals.reduce(
    (acc, meal) => {
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      acc.fats += meal.fats || 0;
      return acc;
    },
    { protein: 0, carbs: 0, fats: 0 }
  );
}

function aggregateTrainingSplit(workouts) {
  const buckets = new Map();
  workouts.forEach((workout) => {
    const key = deriveWorkoutCategory(workout.type);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  });
  const labels = Array.from(buckets.keys());
  const data = labels.map((label) => buckets.get(label));
  return { labels, data };
}

function deriveWorkoutCategory(type = '') {
  const normalized = type.toLowerCase();
  if (normalized.includes('strength') || normalized.includes('lift')) return 'Strength';
  if (normalized.includes('run')) return 'Running';
  if (normalized.includes('cycle') || normalized.includes('bike')) return 'Cycling';
  if (normalized.includes('yoga') || normalized.includes('mobility')) return 'Mobility';
  if (normalized.includes('swim')) return 'Swimming';
  return 'Other';
}

function filterRecent(items, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return items.filter((item) => new Date(item.date) >= cutoff);
}

function average(values) {
  const valid = values.filter((value) => typeof value === 'number' && !Number.isNaN(value));
  if (!valid.length) return 0;
  const sum = valid.reduce((total, value) => total + value, 0);
  return sum / valid.length;
}

function intensityClass(intensity) {
  if (intensity === 'High') return 'danger';
  if (intensity === 'Low') return 'success';
  return '';
}

function formatDate(date) {
  if (!date) return '';
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return formatter.format(new Date(date));
}

function escapeHtml(value = '') {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

// Enhance tables with progress visuals
const style = document.createElement('style');
style.textContent = `
  .progress {
    position: relative;
    height: 12px;
    background: rgba(79, 70, 229, 0.12);
    border-radius: 999px;
    overflow: hidden;
  }
  .progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    background: linear-gradient(90deg, #6366f1, #22d3ee);
  }
  .progress-label {
    display: inline-block;
    margin-top: 0.4rem;
    font-size: 0.8rem;
    color: var(--muted);
  }
`;
document.head.appendChild(style);
