class ApplicationController < ActionController::API
  before_action :authenticate_user!

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  attr_reader :current_user

  private

  def authenticate_user!
    header = request.headers["Authorization"].to_s
    token = header.split.last if header.start_with?("Bearer ")
    payload = decode_token(token)

    @current_user = User.find(payload["user_id"])
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound, NoMethodError
    render json: { error: "Unauthorized" }, status: :unauthorized
  end

  def encode_token(user)
    payload = {
      user_id: user.id,
      exp: 14.days.from_now.to_i
    }
    JWT.encode(payload, jwt_secret, "HS256")
  end

  def decode_token(token)
    JWT.decode(token, jwt_secret, true, algorithm: "HS256").first
  end

  def jwt_secret
    ENV.fetch("JWT_SECRET") { Rails.application.secret_key_base }
  end

  def render_validation_errors(record)
    render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
  end

  def render_not_found
    render json: { error: "Not found" }, status: :not_found
  end
end
