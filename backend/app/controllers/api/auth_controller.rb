module Api
  class AuthController < ApplicationController
    skip_before_action :authenticate_user!, only: [:register, :login]

    def register
      user = User.new(auth_params)

      if user.save
        render json: auth_payload(user), status: :created
      else
        render_validation_errors(user)
      end
    end

    def login
      user = User.find_by(email: params[:email].to_s.strip.downcase)

      if user&.authenticate(params[:password])
        render json: auth_payload(user)
      else
        render json: { error: "Invalid email or password" }, status: :unauthorized
      end
    end

    def me
      render json: { user: user_json(current_user) }
    end

    def logout
      render json: { message: "Logged out" }
    end

    private

    def auth_params
      params.permit(:email, :password, :password_confirmation)
    end

    def auth_payload(user)
      { token: encode_token(user), user: user_json(user) }
    end

    def user_json(user)
      {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    end
  end
end
