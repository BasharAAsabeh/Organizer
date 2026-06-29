class TaskDetail < ApplicationRecord
  belongs_to :task

  validates :task_id, uniqueness: true
  validate :resources_must_be_array

  private

  def resources_must_be_array
    errors.add(:resources, "must be an array") unless resources.is_a?(Array)
  end
end
