module Api
  class CalendarEventsController < ApplicationController
    before_action :set_event, only: [:show, :update, :destroy]

    def index
      events = current_user.calendar_events.order(start_datetime: :asc)
      render json: { calendar_events: events.map { |event| event_json(event) } }
    end

    def show
      render json: { calendar_event: event_json(@event) }
    end

    def create
      event = current_user.calendar_events.new(event_params)

      if event.save
        render json: { calendar_event: event_json(event) }, status: :created
      else
        render_validation_errors(event)
      end
    end

    def update
      if @event.update(event_params)
        render json: { calendar_event: event_json(@event) }
      else
        render_validation_errors(@event)
      end
    end

    def destroy
      @event.destroy
      head :no_content
    end

    private

    def set_event
      @event = current_user.calendar_events.find(params[:id])
    end

    def event_params
      params.permit(:title, :description, :start_datetime, :end_datetime, :event_type)
    end

    def event_json(event)
      {
        id: event.id,
        title: event.title,
        description: event.description,
        start_datetime: event.start_datetime,
        end_datetime: event.end_datetime,
        event_type: event.event_type,
        created_at: event.created_at,
        updated_at: event.updated_at
      }
    end
  end
end
