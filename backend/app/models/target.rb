class Target < ApplicationRecord
  belongs_to :user
  has_many :tasks, dependent: :nullify

  validates :title, presence: true

  scope :active, -> { where(is_finished: false) }
end
