module Api
  class AccountController < ApplicationController
    def show
      render json: { user: user_json(current_user) }
    end

    def update
      unless current_user.authenticate(params[:current_password])
        return render json: { error: "Current password is incorrect" }, status: :unauthorized
      end

      attrs = {}
      attrs[:email] = params[:email] if params[:email].present?
      if params[:password].present?
        attrs[:password] = params[:password]
        attrs[:password_confirmation] = params[:password_confirmation]
      end

      if current_user.update(attrs)
        render json: { token: encode_token(current_user), user: user_json(current_user) }
      else
        render_validation_errors(current_user)
      end
    end

    private

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
