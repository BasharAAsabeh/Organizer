class Task < ApplicationRecord
  PRIORITIES = %w[high medium low].freeze

  belongs_to :user
  belongs_to :target, optional: true
  has_one :task_detail, dependent: :destroy

  validates :title, presence: true
  validates :priority, inclusion: { in: PRIORITIES }

  scope :with_deadlines, -> { where.not(deadline: nil) }
  scope :overdue, -> { where(is_completed: false).where("deadline < ?", Time.current) }
  scope :upcoming, -> { with_deadlines.where("deadline >= ?", Time.current).order(:deadline) }

  def overdue?
    deadline.present? && !is_completed? && deadline < Time.current
  end
end
