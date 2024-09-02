import { Modal } from 'bootstrap'
import { getTime } from './_clock'

// Variables

// Массив тасок
let data = getTasksDataFromLocalStorage()

// Объявление модальных окон (бутстраповские)
const modalAddTaskElement = document.querySelector('#addTaskModal')
const modalEditTaskElement = document.querySelector('#editTaskModal')
const modalDeleteCompletedTasksElement = document.querySelector('#deleteAllModal')
const modalWarningMaxTasksElement = document.querySelector('#warningMaxTasks')

// Инициализация бутстраповских модальных окон, для работы с методами 
const addTaskModal = new Modal(modalAddTaskElement)
const editTaskModal = new Modal(modalEditTaskElement)
const deleteCompletedTasksModal = new Modal(modalDeleteCompletedTasksElement)
const warningMaxTasksModal = new Modal(modalWarningMaxTasksElement)

// Объявление элементов статичной вёрстки
const formAddTaskElement = document.querySelector('#formAddTask')
const formEditTaskElement = document.querySelector('#formEditTask')
const selectUsersElement = document.querySelector('#selectTaskUser')
const editSelectUsersElement = document.querySelector('#editSelectTaskUser')
const listTaskElement = document.querySelector('#tasksList')
const boardPlannedElement = document.querySelector('#boardPlanned')
const boardInProgressElement = document.querySelector('#boardInProgress')
const boardCompletedElement = document.querySelector('#boardCompleted')


// Event listeners
modalAddTaskElement.addEventListener('submit', handleSubmitAddForm)
modalEditTaskElement.addEventListener('submit', handleSubmitEditForm)
modalDeleteCompletedTasksElement.addEventListener('click', handleClickButtonDeleteAll)
listTaskElement.addEventListener('click', handleClickButtonDelete)
listTaskElement.addEventListener('click', handleClickButtonEdit)
listTaskElement.addEventListener('change', handleChangeSelectStatus)


// Handlers
function handleSubmitAddForm(event) {

	// при работе с FormData важен атрибут name
	// name - это ключ для передаваемого значения (значение берётся из инпута)
	// name фигурирует в вёрстке, переменными дублируется в шаблоны и конструкторы
	// в данном случае данные объекта FormData передаются в конструктор Task

	event.preventDefault()

	const { target } = event
	const formData = new FormData(target)
	const fromDataEntries = Object.fromEntries(formData.entries())

	const task = new Task(fromDataEntries)
	data.push(task)

	formAddTaskElement.reset()
	addTaskModal.hide()

	setTasksDataToLocalStorage(data)
	renderTasks(data)
}

function handleClickButtonEdit({ target }) {

	// Ищем изменяемую таску, передаём её данные в инпуты формы (модалка изменения таски)

	if (target.dataset.role === 'editTask') {
		const targetTask = data.find((task) => task.id === getTaskId({ target }))

		// Данные для изменения, видимые пользователю
		document.querySelector('#editTaskTitle').value = targetTask.title
		document.querySelector('#editTaskDescription').value = targetTask.description
		document.querySelector('#editSelectTaskUser').value = targetTask.user
		document.querySelector('#editSelectTaskPriority').value = targetTask.priority

		// Данные для сохранения, скрытые от пользователя
		document.querySelector('#editTaskId').value = targetTask.id
		document.querySelector('#editTaskCreatedAt').value = targetTask.createdAt.toLocaleString()
		document.querySelector('#editTaskStatus').value = targetTask.status

		editTaskModal.show()
	}
}

function handleSubmitEditForm(event) {

	// Через сохранённый в FormData Id ищем изменяемую таску и заменяем её

	event.preventDefault()

	const { target } = event
	const formData = new FormData(target)
	const fromDataEntries = Object.fromEntries(formData.entries())

	const editedTask = data.find((task) => task.id === fromDataEntries.id)
	const editedIndexTask = data.indexOf(editedTask)
	data.splice(editedIndexTask, 1, fromDataEntries)

	formEditTaskElement.reset()
	editTaskModal.hide()

	setTasksDataToLocalStorage(data)
	renderTasks(data)
}

function handleClickButtonDelete({ target }) {

	// Ищем нужную таску и вырезаем её

	if (target.dataset.role == 'deleteTask') {
		const targetTask = data.find((task) => task.id === getTaskId({ target }))
		const targetIndexTask = data.indexOf(targetTask)
		data.splice(targetIndexTask, 1)

		setTasksDataToLocalStorage(data)
		renderTasks(getTasksDataFromLocalStorage())
	}
}

function handleChangeSelectStatus({ target }) {

	// Первым if проверяем количество тасок "in progress" (если 6 - вызываем модалку-предупреждение)
	// Вторым if ищем нужную таску, меняем её статус

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

function handleClickButtonDeleteAll({ target }) {
	let targetTasksId = []

	// Собираем таски для удаления в отдельный массив
	if (target.dataset.role == 'deleteAllCompletedTasks') {
		data.forEach((task) => {
			if (task.status === 'completed') {
				targetTasksId.push(task.id)
			}
		})
	}

	// Ищем таски из полученного массива в исходном массиве, вырезаем совпадения
	for (let id of targetTasksId) {
		const targetTask = data.find((task) => task.id === id)
		const targetIndexTask = data.indexOf(targetTask)
		data.splice(targetIndexTask, 1)

		setTasksDataToLocalStorage(data)
		renderTasks(getTasksDataFromLocalStorage())
	}

	deleteCompletedTasksModal.hide()
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
	// name внутри тега - это данные для отрисовки в селекте юзеров (форма модалки создания и изменения таски)

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
	// Отрисовка в селекте юзеров (форма модалки создания и изменения таски)

	selectUsersElement.insertAdjacentHTML('beforeend', templateUsers(data))
	editSelectUsersElement.insertAdjacentHTML('beforeend', templateUsers(data))
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