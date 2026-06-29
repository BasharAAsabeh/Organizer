Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    post "auth/register", to: "auth#register"
    post "auth/login", to: "auth#login"
    get "auth/me", to: "auth#me"
    delete "auth/logout", to: "auth#logout"

    resource :account, only: [:show, :update], controller: "account"
    get "dashboard", to: "dashboard#show"
    get "calendar/month", to: "calendar#month"
    get "calendar/day", to: "calendar#day"

    resources :targets
    resources :tasks do
      resource :task_detail, only: [:show, :create, :update, :destroy]
    end
    resources :calendar_events
  end
end
