import { Modal } from 'bootstrap'
import { getTime } from './_clock'

// Variables
let data = getTasksData()
const modalAddTaskElement = document.querySelector('#addTaskModal')
const formAddTaskElement = document.querySelector('#formAddTask')
const selectUsersElement = document.querySelector('#selectTaskUser')
const listTaskElement = document.querySelector('#tasksList')
const boardPlannedElement = document.querySelector('#boardPlanned')
const boardInProgressElement = document.querySelector('#boardInProgress')
const boardCompletedElement = document.querySelector('#boardCompleted')
const createTaskModal = new Modal(modalAddTaskElement)


// Add event listeners
modalAddTaskElement.addEventListener('submit', handleSubmitForm)
listTaskElement.addEventListener('click', handleDeleteTask)
listTaskElement.addEventListener('click', handleEditTask)
listTaskElement.addEventListener('change', handleChangeTaskStatus)


// Handlers
// при работе с FormData нужен атрибут name - это ключ для передаваемого значения
// (фигурирует в вёрстке, дублируется в шаблоны и модели)
function handleSubmitForm(event) {
	event.preventDefault()

	const { target } = event
	const formData = new FormData(target)
	const fromDataEntries = Object.fromEntries(formData.entries())

	const task = new Task(fromDataEntries)
	data.push(task)

	formAddTaskElement.reset()
	createTaskModal.hide()

	setTasksData(data)
	renderTasks(data)
}

function handleDeleteTask({ target }) {
	if (target.dataset.role == 'deleteTask') {
		const targetTask = data.find((task) => task.id === getTaskId({ target }))

		const targetIndexTask = data.indexOf(targetTask)
		data.splice(targetIndexTask, 1)

		setTasksData(data)
		renderTasks(getTasksData())
	}
}

function handleChangeTaskStatus({ target }) {
	if (target.dataset.role == 'status') {
		const targetTask = data.find((task) => task.id === getTaskId({ target }))

		targetTask.status = target.value
		setTasksData(data)
		renderTasks(getTasksData())
	}
}

function handleEditTask() {
	console.log('click')
}


// Templates
function templateTask({ id, title, description, createdAt, user, priority, status }) {
	const date = createdAt.toLocaleString()
	const plannedAttr = (status === 'planned') ? 'selected' : ''
	const inProgressAttr = (status === 'inProgress') ? 'selected' : ''
	const completedAttr = (status === 'completed') ? 'selected' : ''

	return `
		<div class="task" data-id=${id}>
			<div class="task__info-container">
				<div class="task__title">
					<p>${title}</p>
					<p>${priority}</p>
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

function templateUsers({ name }) {
	return `
		<option value="${name}">${name}</option>
	`
}


// Models
function Task({ title, description, user, priority }) {
	this.id = crypto.randomUUID()
	this.title = title
	this.description = description
	this.createdAt = new Date()
	this.user = user
	this.priority = priority
	this.status = 'planned'
}


// Helpers
function getUsers(url) {
	fetch(url)
		.then((response) => {
			if (!response.ok) throw new Error(response.status)

			return response.json()
		})
		.then((data) => {
			data.forEach((item) => renderUsers(item))
		})
		.catch((error) => {
			alert(`${error}`)
		})
}

function renderUsers(data) {
	selectUsersElement.insertAdjacentHTML('beforeend', templateUsers(data))
}

function renderTasks(data) {
	boardPlannedElement.innerHTML = ''
	boardInProgressElement.innerHTML = ''
	boardCompletedElement.innerHTML = ''

	data.forEach((task) => {
		switch (task.status) {
			case 'planned':
				boardPlannedElement.insertAdjacentHTML('afterbegin', templateTask(task))
				break
			case 'inProgress':
				boardInProgressElement.insertAdjacentHTML('afterbegin', templateTask(task))
				break
			case 'completed':
				boardCompletedElement.insertAdjacentHTML('afterbegin', templateTask(task))
				break
		}
	})
}

function getTasksData() {
	const tasks = JSON.parse(localStorage.getItem('tasks'))

	if (!tasks) return []

	return tasks.map((task) => {
		task.createdAt = new Date(task.createdAt)

		return task
	})
}

function setTasksData(task) {
	localStorage.setItem('tasks', JSON.stringify(task))
}

function getTaskId({ target }) {
	const taskId = target.closest('.task').dataset.id
	return taskId
}



// init
getUsers('https://jsonplaceholder.typicode.com/users')
renderTasks(data)
setInterval(getTime, 1000)