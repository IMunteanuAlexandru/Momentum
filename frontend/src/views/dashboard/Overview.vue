<template>
  <div class="overview-container">
    <header class="page-header">
      <h1>Dashboard Overview</h1>
      <div class="header-actions">
        <button class="btn-new-task">
          <i class="fas fa-plus"></i>
          New Task
        </button>
      </div>
    </header>

    <div class="overview-grid">
      <!-- Quick Stats -->
      <div class="overview-card stats-card">
        <h3>Today's Progress</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">5</div>
            <div class="stat-label">Tasks Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">3</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">85%</div>
            <div class="stat-label">Productivity</div>
          </div>
        </div>
      </div>

      <!-- Recent Tasks -->
      <div class="overview-card tasks-card">
        <h3>Recent Tasks</h3>
        <div class="task-list">
          <div class="task-item">
            <div class="task-status completed"></div>
            <div class="task-content">
              <h4>Complete Project Presentation</h4>
              <p>Due today at 15:00</p>
            </div>
          </div>
          <div class="task-item">
            <div class="task-status in-progress"></div>
            <div class="task-content">
              <h4>Review Code Changes</h4>
              <p>Due tomorrow at 12:00</p>
            </div>
          </div>
          <div class="task-item">
            <div class="task-status pending"></div>
            <div class="task-content">
              <h4>Team Meeting</h4>
              <p>Thursday at 10:00</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Productivity Chart -->
      <div class="overview-card chart-card">
        <h3>Weekly Productivity</h3>
        <div class="chart-container">
          <div class="placeholder-chart">
            <div class="chart-bar" style="height: 60%"></div>
            <div class="chart-bar" style="height: 80%"></div>
            <div class="chart-bar" style="height: 40%"></div>
            <div class="chart-bar" style="height: 90%"></div>
            <div class="chart-bar" style="height: 70%"></div>
            <div class="chart-bar" style="height: 50%"></div>
            <div class="chart-bar" style="height: 75%"></div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="overview-card actions-card">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button class="action-btn">
            <i class="fas fa-bullseye"></i>
            <span>Set Goal</span>
          </button>
          <button class="action-btn">
            <i class="fas fa-bell"></i>
            <span>Reminders</span>
          </button>
          <button class="action-btn">
            <i class="fas fa-sticky-note"></i>
            <span>Notes</span>
          </button>
          <button class="action-btn">
            <i class="fas fa-chart-bar"></i>
            <span>Reports</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component logic will be added later
</script>

<style scoped>
.overview-container {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  color: var(--text);
  font-size: 2rem;
  font-weight: 600;
}

.btn-new-task {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary);
  color: var(--text);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-new-task:hover {
  opacity: 0.9;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.overview-card {
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--primary);
}

.overview-card h3 {
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  background-color: var(--primary);
  padding: 1rem;
  border-radius: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text);
  font-size: 0.875rem;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--primary);
  border-radius: 8px;
}

.task-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.task-status.completed {
  background-color: #4caf50;
}

.task-status.in-progress {
  background-color: #ff9800;
}

.task-status.pending {
  background-color: #f44336;
}

.task-content h4 {
  color: var(--text);
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.task-content p {
  color: var(--text);
  font-size: 0.875rem;
  opacity: 0.8;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding: 1rem 0;
}

.placeholder-chart {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 1rem 0;
}

.chart-bar {
  width: 40px;
  background-color: var(--primary);
  border-radius: 4px;
  transition: height 0.3s ease;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background-color: var(--primary);
  border: none;
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  background-color: var(--secondary);
}

.action-btn i {
  font-size: 1.5rem;
}

@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .overview-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style> 