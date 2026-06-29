module Api
  class TargetsController < ApplicationController
    before_action :set_target, only: [:show, :update, :destroy]

    def index
      targets = current_user.targets.left_joins(:tasks).group(:id).order(is_finished: :asc, deadline: :asc, created_at: :desc)
      render json: { targets: targets.map { |target| target_json(target) } }
    end

    def show
      render json: { target: target_json(@target) }
    end

    def create
      target = current_user.targets.new(target_params)

      if target.save
        render json: { target: target_json(target) }, status: :created
      else
        render_validation_errors(target)
      end
    end

    def update
      if @target.update(target_params)
        render json: { target: target_json(@target) }
      else
        render_validation_errors(@target)
      end
    end

    def destroy
      @target.destroy
      head :no_content
    end

    private

    def set_target
      @target = current_user.targets.find(params[:id])
    end

    def target_params
      params.permit(:title, :description, :deadline, :is_finished)
    end

    def target_json(target)
      {
        id: target.id,
        title: target.title,
        description: target.description,
        deadline: target.deadline,
        is_finished: target.is_finished,
        task_count: target.tasks.size,
        completed_task_count: target.tasks.count(&:is_completed?),
        created_at: target.created_at,
        updated_at: target.updated_at
      }
    end
  end
end
