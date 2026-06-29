user = User.find_or_create_by!(email: "bashar@example.com") do |record|
  record.password = "password123"
  record.password_confirmation = "password123"
end

mvp = user.targets.find_or_create_by!(title: "Build Organizer MVP") do |target|
  target.description = "Ship the Rails API and connected React organizer."
  target.deadline = 11.days.from_now.to_date
end

sql = user.targets.find_or_create_by!(title: "Finish SQL lab revision") do |target|
  target.description = "Review joins, grouping, indexes, and query plans."
  target.is_finished = true
end

user.tasks.find_or_create_by!(title: "Finish Rails API auth") do |task|
  task.priority = "high"
  task.deadline = Time.current.end_of_day
  task.has_detail_page = true
  task.target = mvp
end.tap do |task|
  task.create_task_detail!(
    notes: "Models needed: User, Target, Task, TaskDetail, CalendarEvent.\n\nKeep task deadlines visible in calendar data without duplicating tasks.",
    resources: [
      { label: "Rails API docs", url: "https://guides.rubyonrails.org/api_app.html" },
      { label: "PostgreSQL schema", url: "https://www.postgresql.org/docs/" }
    ]
  ) unless task.task_detail
end

user.tasks.find_or_create_by!(title: "Review PostgreSQL schema") do |task|
  task.priority = "medium"
  task.deadline = 1.day.from_now
  task.is_completed = true
  task.target = sql
end

user.tasks.find_or_create_by!(title: "Write homepage cards") do |task|
  task.priority = "medium"
  task.deadline = 1.day.ago
end

user.tasks.find_or_create_by!(title: "Connect calendar data") do |task|
  task.priority = "low"
  task.deadline = 3.days.from_now
  task.target = mvp
end

user.calendar_events.find_or_create_by!(title: "Pinned note", start_datetime: Time.current.change(hour: 14)) do |event|
  event.event_type = "pinned"
  event.description = "Keep today's build notes visible."
end
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
