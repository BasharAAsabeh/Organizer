class CalendarEvent < ApplicationRecord
  EVENT_TYPES = %w[event note pinned].freeze

  belongs_to :user

  validates :title, :start_datetime, presence: true
  validates :event_type, inclusion: { in: EVENT_TYPES }
  validate :end_datetime_after_start

  scope :between, ->(start_time, end_time) { where(start_datetime: start_time..end_time) }

  private

  def end_datetime_after_start
    return if end_datetime.blank? || start_datetime.blank? || end_datetime >= start_datetime

    errors.add(:end_datetime, "must be after the start time")
  end
end
