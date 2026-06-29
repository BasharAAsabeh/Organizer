class User < ApplicationRecord
  has_secure_password

  has_many :targets, dependent: :destroy
  has_many :tasks, dependent: :destroy
  has_many :calendar_events, dependent: :destroy

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :email, presence: true, uniqueness: { case_sensitive: false },
    format: { with: URI::MailTo::EMAIL_REGEXP }
end
