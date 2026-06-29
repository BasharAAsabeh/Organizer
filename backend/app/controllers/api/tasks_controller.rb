module Api
  class TasksController < ApplicationController
    before_action :set_task, only: [:show, :update, :destroy]

    def index
      tasks = current_user.tasks.includes(:target, :task_detail)
      tasks = apply_filters(tasks)
      render json: { tasks: tasks.map { |task| task_json(task) } }
    end

    def show
      render json: { task: task_json(@task, include_detail: true) }
    end

    def create
      task = current_user.tasks.new(task_params)
      ensure_target_belongs_to_user!(task)

      if task.save
        ensure_task_detail(task) if task.has_detail_page?
        render json: { task: task_json(task.reload, include_detail: true) }, status: :created
      else
        render_validation_errors(task)
      end
    end

    def update
      @task.assign_attributes(task_params)
      ensure_target_belongs_to_user!(@task)

      if @task.save
        if @task.has_detail_page?
          ensure_task_detail(@task)
        elsif @task.task_detail.present?
          @task.task_detail.destroy
        end
        render json: { task: task_json(@task.reload, include_detail: true) }
      else
        render_validation_errors(@task)
      end
    end

    def destroy
      @task.destroy
      head :no_content
    end

    private

    def set_task
      @task = current_user.tasks.includes(:target, :task_detail).find(params[:id])
    end

    def task_params
      params.permit(:title, :description, :priority, :deadline, :is_completed, :has_detail_page, :target_id)
    end

    def apply_filters(scope)
      scope = case params[:filter]
      when "completed" then scope.where(is_completed: true)
      when "pending" then scope.where(is_completed: false)
      when "overdue" then scope.overdue
      else scope
      end

      case params[:sort]
      when "priority"
        scope.order(Arel.sql("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END"), deadline: :asc)
      when "deadline"
        scope.order(Arel.sql("deadline IS NULL"), deadline: :asc)
      else
        scope.order(created_at: :desc)
      end
    end

    def ensure_target_belongs_to_user!(task)
      task.target_id = nil if task.target_id.blank?
      return if task.target_id.nil? || current_user.targets.exists?(task.target_id)

      raise ActiveRecord::RecordNotFound
    end

    def ensure_task_detail(task)
      task.create_task_detail!(notes: "", resources: []) unless task.task_detail
    end

    def task_json(task, include_detail: false)
      data = {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline,
        is_completed: task.is_completed,
        has_detail_page: task.has_detail_page,
        overdue: task.overdue?,
        target_id: task.target_id,
        target_title: task.target&.title,
        created_at: task.created_at,
        updated_at: task.updated_at
      }

      if include_detail
        data[:task_detail] = task.task_detail && {
          id: task.task_detail.id,
          notes: task.task_detail.notes,
          resources: task.task_detail.resources
        }
      end

      data
    end
  end
end
