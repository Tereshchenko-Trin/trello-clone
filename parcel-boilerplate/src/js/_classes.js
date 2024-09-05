class Task {
	id = crypto.randomUUID()
	createdAt = new Date()
	status = 'planned'

	constructor({ title, description, user, priority }) {
		this.title = title
		this.description = description
		this.user = user
		this.priority = priority

	}

	static template({ id, title, description, createdAt, user, priority, status }) {

		// Данные из формы модалки: title, description, user, priority
		// Данные создаются динамически: id, createdAt
		// Данные по дефолту (planned): status

		const date = createdAt.toLocaleString()

		const plannedAttr = (status === 'planned') ? 'selected' : ''
		const inProgressAttr = (status === 'inProgress') ? 'selected' : ''
		const completedAttr = (status === 'completed') ? 'selected' : ''

		let priorityAttr = ''
		switch (priority) {
			case 'Low':
				priorityAttr = 'Low'
				break
			case 'Medium':
				priorityAttr = 'Medium'
				break
			case 'High':
				priorityAttr = 'high'
				break
		}

		return `
			<div class="task" data-id=${id}>
				<div class="task__info-container">
					<div class="task__title-container">
						<div class="task__title"><p>${title}</p></div>
						<div class="task__priority" ${priorityAttr}><p>${priority}</p></div>
					</div>
					<div class="task__description">
						<p>${description}</p>
					</div>
					<div class="task__date">
						<p>${date}</p>
					</div>
					<div class="task__user">
						<p>${user}</p>
					</div>
				</div>
				<div class="task__buttons-container">
					<select class="task__board-select form-select" name="status" data-role="status">
						<option value="planned" ${plannedAttr}>Plapped</option>
						<option value="inProgress" ${inProgressAttr}>In Progress</option>
						<option value="completed" ${completedAttr}>Completed</option>
					</select>
					<button id="buttonEditTask" type="button" class="task__button btn btn-outline-primary" data-role="editTask">Edit</button>
					<button id="buttonDeleteTask" type="button" class="task__button btn btn-outline-danger" data-role="deleteTask"><i
							class="bi bi-trash3 pe-none"></i></button>
				</div>
			</div>
		`
	}

	static getDataFromLocalStorage() {

		// Получение данных из хранилища с ререндером даты создания в нормальном виде

		const tasks = JSON.parse(localStorage.getItem('tasks'))

		if (!tasks) return []

		return tasks.map((task) => {
			task.createdAt = new Date(task.createdAt)

			return task
		})
	}

	static setDataToLocalStorage(task) {
		localStorage.setItem('tasks', JSON.stringify(task))
	}

	static render(data) {
		const boardPlannedElement = document.querySelector('#boardPlanned')
		const boardInProgressElement = document.querySelector('#boardInProgress')
		const boardCompletedElement = document.querySelector('#boardCompleted')

		boardPlannedElement.innerHTML = ''
		boardInProgressElement.innerHTML = ''
		boardCompletedElement.innerHTML = ''

		data.forEach((task) => {
			switch (task.status) {
				case 'planned':
					boardPlannedElement.insertAdjacentHTML('afterbegin', this.template(task))
					break
				case 'inProgress':
					boardInProgressElement.insertAdjacentHTML('afterbegin', this.template(task))
					break
				case 'completed':
					boardCompletedElement.insertAdjacentHTML('afterbegin', this.template(task))
					break
			}
		})

		this.countTasks(data)
	}

	static countTasks(data) {
		const counterPlannedTasksElement = document.querySelector('#counterPlanned')
		const counterInProgressTasksElement = document.querySelector('#counterInProgress')
		const counterCompletedTasksElement = document.querySelector('#counterCompleted')

		let plannedTasks = data.filter((task) => task.status === 'planned')
		let inProgressTasks = data.filter((task) => task.status === 'inProgress')
		let completedTasks = data.filter((task) => task.status === 'completed')

		counterPlannedTasksElement.textContent = `(${plannedTasks.length})`
		counterInProgressTasksElement.textContent = `(${inProgressTasks.length})`
		counterCompletedTasksElement.textContent = `(${completedTasks.length})`
	}


	static getId({ target }) {
		const taskId = target.closest('.task').dataset.id
		return taskId
	}
}

class Users {

	static template({ name }) {

		// name в value - это данные, которые идут в объект таски
		// name внутри тега - это данные для отрисовки в селекте юзеров (форма модалки создания и изменения таски)

		return `
			<option value="${name}">${name}</option>
		`
	}

	static getData(url) {
		fetch(url)
			.then((response) => {
				if (!response.ok) throw new Error(response.status)

				return response.json()
			})
			.then((data) => {
				data.forEach((item) => this.render(item))
			})
			.catch((error) => {
				alert(`${error}`)
			})
	}

	static render(data) {

		// Вызывается в fetch при положительном response
		// Отрисовка в селекте юзеров (форма модалки создания и изменения таски)

		const selectUsersElement = document.querySelector('#selectTaskUser')
		const editSelectUsersElement = document.querySelector('#editSelectTaskUser')

		selectUsersElement.insertAdjacentHTML('beforeend', this.template(data))
		editSelectUsersElement.insertAdjacentHTML('beforeend', this.template(data))
	}
}

export {
	Task,
	Users
}