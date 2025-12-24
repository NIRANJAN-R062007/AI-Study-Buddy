import React, { useState, useEffect } from 'react'
import { useStudyBuddy } from '../../context/StudyBuddyContext'
import { studyBuddyAPI } from '../../services/api'

export default function StudyPlan() {
  const { state, dispatch } = useStudyBuddy()
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    topic: '',
    daily_hours: 2,
    target_days: ''
  })

  useEffect(() => {
    loadStudyPlans()
  }, [])

  const loadStudyPlans = async () => {
    try {
      const plans = await studyBuddyAPI.getStudyPlans()
      dispatch({ type: 'SET_STUDY_PLANS', payload: plans })
    } catch (err) {
      console.error('Failed to load study plans:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const newPlan = await studyBuddyAPI.createStudyPlan({
        topic: formData.topic,
        daily_hours: parseFloat(formData.daily_hours),
        target_days: parseInt(formData.target_days)
      })

      dispatch({ type: 'ADD_STUDY_PLAN', payload: newPlan })
      setShowForm(false)
      setFormData({ topic: '', daily_hours: 2, target_days: '' })
    } catch (err) {
      setError('Failed to create study plan. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem'
      }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>Study Plans</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your learning goals and schedules</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
          style={{ background: showForm ? '#ef4444' : 'var(--primary-gradient)' }}
        >
          {showForm ? 'Cancel' : '+ Create New Plan'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '20px',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 3rem', animation: 'slideIn 0.3s ease-out' }}>
          <h2 style={{ marginBottom: '2rem' }}>Create Custom Study Plan</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Topic</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., Python, Calculus, Physics"
                className="input-field"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Hours per Day</label>
                <input
                  type="number"
                  name="daily_hours"
                  value={formData.daily_hours}
                  onChange={handleChange}
                  min="0.5"
                  max="24"
                  step="0.5"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Target Duration (Days)</label>
                <input
                  type="number"
                  name="target_days"
                  value={formData.target_days}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g. 30"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {isLoading ? 'Generating Plan...' : 'Generate Study Plan'}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
        {state.studyPlans.map((plan) => (
          <div key={plan.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.25rem' }}>{plan.topic} Mastery</h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Deadline: {new Date(plan.deadline).toLocaleDateString()}
                </p>
              </div>
              <span style={{
                padding: '4px 12px',
                background: 'var(--bg-green-50)',
                color: 'var(--text-green-600)',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '700',
                border: '1px solid #a7f3d0'
              }}>
                ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>{plan.total_hours}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Hours</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>{plan.daily_hours}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hours/Day</div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Weekly Goals</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {Array.isArray(plan.weekly_goals) && plan.weekly_goals.length > 0 ? (
                  plan.weekly_goals.map((goal, index) => {
                    // Handle both old (string) and new (object) formats
                    const isComplex = typeof goal === 'object' && goal !== null;
                    const weekNum = isComplex ? goal.week : index + 1;
                    const theme = isComplex ? goal.theme : (typeof goal === 'string' ? goal.replace(/^Week \d+: /, '') : 'Goal');
                    const subGoals = isComplex && Array.isArray(goal.goals) ? goal.goals : [];

                    return (
                      <div key={index} style={{
                        background: 'var(--bg-main)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '0.95rem' }}>Week {weekNum}</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                            {theme}
                          </span>
                        </div>

                        {subGoals.length > 0 && (
                          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {subGoals.map((subGoal, i) => (
                              <li key={i} style={{ marginBottom: '0.25rem' }}>{subGoal}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No weekly goals generated.</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              <button style={{
                flex: 1,
                padding: '0.75rem',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 'var(--radius-md)',
                color: 'var(--primary-color)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
                onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                onMouseOut={(e) => e.target.style.background = 'white'}
              >
                View Full Plan
              </button>
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this study plan?')) {
                    try {
                      await studyBuddyAPI.deleteStudyPlan(plan.id);
                      dispatch({ type: 'DELETE_STUDY_PLAN', payload: plan.id });
                    } catch (err) {
                      console.error('Failed to delete plan:', err);
                      alert('Failed to delete plan');
                    }
                  }
                }}
                style={{
                  padding: '0.75rem',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#991b1b',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#fecaca'}
                onMouseOut={(e) => e.target.style.background = '#fee2e2'}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {state.studyPlans.length === 0 && !showForm && (
          <div className="card" style={{
            gridColumn: '1 / -1',
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            border: '2px dashed #e5e7eb',
            background: 'transparent',
            boxShadow: 'none'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📅</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No Study Plans Yet</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Create your first study plan to get started!</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Create First Plan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
