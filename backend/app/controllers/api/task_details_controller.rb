module Api
  class TaskDetailsController < ApplicationController
    before_action :set_task
    before_action :set_task_detail, only: [:show, :update, :destroy]

    def show
      render json: { task_detail: detail_json(@task_detail) }
    end

    def create
      detail = @task.build_task_detail(detail_params)

      if detail.save
        @task.update(has_detail_page: true)
        render json: { task_detail: detail_json(detail) }, status: :created
      else
        render_validation_errors(detail)
      end
    end

    def update
      if @task_detail.update(detail_params)
        @task.update(has_detail_page: true)
        render json: { task_detail: detail_json(@task_detail) }
      else
        render_validation_errors(@task_detail)
      end
    end

    def destroy
      @task_detail.destroy
      @task.update(has_detail_page: false)
      head :no_content
    end

    private

    def set_task
      @task = current_user.tasks.find(params[:task_id])
    end

    def set_task_detail
      @task_detail = @task.task_detail || raise(ActiveRecord::RecordNotFound)
    end

    def detail_params
      params.permit(:notes, resources: [:label, :url])
    end

    def detail_json(detail)
      {
        id: detail.id,
        task_id: detail.task_id,
        notes: detail.notes,
        resources: detail.resources,
        created_at: detail.created_at,
        updated_at: detail.updated_at
      }
    end
  end
end
