module Api
  class CalendarController < ApplicationController
    def month
      date = Date.new(params.fetch(:year, Date.current.year).to_i, params.fetch(:month, Date.current.month).to_i, 1)
      render json: calendar_payload(date.beginning_of_month.beginning_of_day, date.end_of_month.end_of_day)
    end

    def day
      date = Date.new(params.fetch(:year, Date.current.year).to_i, params.fetch(:month, Date.current.month).to_i, params.fetch(:day, Date.current.day).to_i)
      render json: calendar_payload(date.beginning_of_day, date.end_of_day).merge(date: date)
    end

    private

    def calendar_payload(start_time, end_time)
      tasks = current_user.tasks.with_deadlines.where(deadline: start_time..end_time).includes(:target)
      events = current_user.calendar_events.between(start_time, end_time)

      {
        tasks: tasks.order(:deadline).map { |task| task_item(task) },
        calendar_events: events.order(:start_datetime).map { |event| event_item(event) }
      }
    end

    def task_item(task)
      {
        id: task.id,
        title: task.title,
        type: "task",
        priority: task.priority,
        deadline: task.deadline,
        is_completed: task.is_completed,
        has_detail_page: task.has_detail_page,
        target_title: task.target&.title,
        overdue: task.overdue?
      }
    end

    def event_item(event)
      {
        id: event.id,
        title: event.title,
        type: event.event_type,
        description: event.description,
        start_datetime: event.start_datetime,
        end_datetime: event.end_datetime
      }
    end
  end
end
