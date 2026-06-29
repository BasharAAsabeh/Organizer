module Api
  class DashboardController < ApplicationController
    def show
      tasks = current_user.tasks.includes(:target)
      targets = current_user.targets.includes(:tasks)
      today_range = Time.current.beginning_of_day..Time.current.end_of_day
      week_range = Date.current.beginning_of_week(:sunday)..Date.current.end_of_week(:sunday)

      render json: {
        stats: {
          total_tasks: tasks.size,
          completed_tasks: tasks.count(&:is_completed?),
          pending_tasks: tasks.count { |task| !task.is_completed? },
          overdue_tasks: tasks.count(&:overdue?),
          active_targets: targets.count { |target| !target.is_finished? }
        },
        today_tasks: tasks.select { |task| task.deadline&.between?(today_range.first, today_range.last) }.map { |task| task_item(task) },
        overdue_tasks: tasks.select(&:overdue?).sort_by(&:deadline).first(6).map { |task| task_item(task) },
        upcoming_deadlines: tasks.select { |task| task.deadline.present? && task.deadline >= Time.current }.sort_by(&:deadline).first(8).map { |task| task_item(task) },
        target_progress: targets.map { |target| target_progress(target) },
        week: week_range.map { |date| week_day(date) }
      }
    end

    private

    def task_item(task)
      {
        id: task.id,
        title: task.title,
        priority: task.priority,
        deadline: task.deadline,
        is_completed: task.is_completed,
        overdue: task.overdue?,
        target_title: task.target&.title
      }
    end

    def target_progress(target)
      total = target.tasks.size
      completed = target.tasks.count(&:is_completed?)

      {
        id: target.id,
        title: target.title,
        deadline: target.deadline,
        is_finished: target.is_finished,
        task_count: total,
        completed_task_count: completed,
        percent: total.zero? ? 0 : ((completed.to_f / total) * 100).round
      }
    end

    def week_day(date)
      start_time = date.beginning_of_day
      end_time = date.end_of_day

      {
        date: date,
        task_count: current_user.tasks.with_deadlines.where(deadline: start_time..end_time).count,
        event_count: current_user.calendar_events.between(start_time, end_time).count
      }
    end
  end
end
