import { Modal } from 'bootstrap'
import { getTime } from './_clock'

// Variables

// Массив тасок
let data = getTasksDataFromLocalStorage()

// Объявление модальных окон (бутстраповские)
const modalAddTaskElement = document.querySelector('#addTaskModal')
const modalDeleteCompletedTasksElement = document.querySelector('#deleteAllModal')
const modalWarningMaxTasksElement = document.querySelector('#warningMaxTasks')

// Инициализация бутстраповских методов модальных окон
const createTaskModal = new Modal(modalAddTaskElement)
const deleteCompletedTasksModal = new Modal(modalDeleteCompletedTasksElement)
const warningMaxTasksModal = new Modal(modalWarningMaxTasksElement)

// Объявление элементов статичной вёрстки
const formAddTaskElement = document.querySelector('#formAddTask')
const selectUsersElement = document.querySelector('#selectTaskUser')
const listTaskElement = document.querySelector('#tasksList')
const boardPlannedElement = document.querySelector('#boardPlanned')
const boardInProgressElement = document.querySelector('#boardInProgress')
const boardCompletedElement = document.querySelector('#boardCompleted')


// Event listeners
modalAddTaskElement.addEventListener('submit', handleSubmitForm)
listTaskElement.addEventListener('click', handleDeleteTask)
listTaskElement.addEventListener('click', handleEditTask)
listTaskElement.addEventListener('change', handleChangeTaskStatus)
modalDeleteCompletedTasksElement.addEventListener('click', handleDeleteAllCompletedTasks)


// Handlers
function handleSubmitForm(event) {

	// при работе с FormData важен атрибут name
	// name - это ключ для передаваемого значения
	// значение берётся из инпута
	// (фигурирует в вёрстке, дублируется в шаблоны и конструкторы)

	event.preventDefault()

	const { target } = event
	const formData = new FormData(target)
	const fromDataEntries = Object.fromEntries(formData.entries())

	const task = new Task(fromDataEntries)
	data.push(task)

	formAddTaskElement.reset()
	createTaskModal.hide()

	setTasksDataToLocalStorage(data)
	renderTasks(data)
}

function handleDeleteTask({ target }) {
	if (target.dataset.role == 'deleteTask') {
		const targetTask = data.find((task) => task.id === getTaskId({ target }))

		const targetIndexTask = data.indexOf(targetTask)
		data.splice(targetIndexTask, 1)

		setTasksDataToLocalStorage(data)
		renderTasks(getTasksDataFromLocalStorage())
	}
}

function handleChangeTaskStatus({ target }) {

	// Меняем статус тасок + проверяем количество тасок "in progress"
	// Если 6 тасок "in progress" - вызываем модалку-предупреждение

	const inProgressTasks = data.filter((task) => task.status === 'inProgress')

	if (inProgressTasks.length === 6 && target.value === 'inProgress') {
		warningMaxTasksModal.show()
	} else if (target.dataset.role === 'status') {
		const targetTask = data.find((task) => task.id === getTaskId({ target }))

		targetTask.status = target.value
		setTasksDataToLocalStorage(data)
		renderTasks(getTasksDataFromLocalStorage())
	}
}

function handleDeleteAllCompletedTasks({ target }) {
	let targetTasksId = []

	// Собираем таски для удаления в отдельный массив
	if (target.dataset.role == 'deleteAllCompletedTasks') {
		data.forEach((task) => {
			if (task.status === 'completed') {
				targetTasksId.push(task.id)
			}
		})
	}

	// Ищем таски из полученного массива в исходном массиве, удаляем
	for (let id of targetTasksId) {
		const targetTask = data.find((task) => task.id === id)
		const targetIndexTask = data.indexOf(targetTask)
		data.splice(targetIndexTask, 1)

		setTasksDataToLocalStorage(data)
		renderTasks(getTasksDataFromLocalStorage())
	}

	deleteCompletedTasksModal.hide()
}

function handleEditTask() {
	console.log('click')
}


// Templates
function templateTask({ id, title, description, createdAt, user, priority, status }) {

	// Данные из формы модалки: title, description, user, priority
	// Данные создаются динамически: id, createdAt
	// Данные по дефолту (planned): status

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

	// name в value - это данные, которые идут в объект таски
	// name внутри тега - это данные для отрисовки в селекте юзеров (форма модалки создания таски)

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

	// Вызывается в fetch при положительном response
	// Отрисовка в селекте юзеров (форма модалки создания таски)

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

	countTasks(data)
}

function countTasks(data) {
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

function getTasksDataFromLocalStorage() {
	const tasks = JSON.parse(localStorage.getItem('tasks'))

	if (!tasks) return []

	return tasks.map((task) => {
		task.createdAt = new Date(task.createdAt)

		return task
	})
}

function setTasksDataToLocalStorage(task) {
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