import { Modal } from 'bootstrap'
import { getTime } from './_clock'
import { Task, Users } from './_classes'


// Variables
// Массив тасок
let data = Task.getDataFromLocalStorage()

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
const listTaskElement = document.querySelector('#tasksList')
const formSearchTaskElement = document.querySelector('#formSearch')
const logoElement = document.querySelector('#logo')


// Event listeners
modalAddTaskElement.addEventListener('submit', handleSubmitAddForm)
modalEditTaskElement.addEventListener('submit', handleSubmitEditForm)
modalDeleteCompletedTasksElement.addEventListener('click', handleClickButtonDeleteAll)
listTaskElement.addEventListener('change', onChangeSelectStatus)
listTaskElement.addEventListener('click', handleClickContainer)
formSearchTaskElement.addEventListener('submit', handleSubmitSearchForm)
logoElement.addEventListener('click', handleClickLogo)


// Handlers
function handleClickContainer({ target }) {

	// Вызываю точечные события по клику, обработчик которых висит на общем контейнере

	if (target.dataset.role == 'deleteTask') onClickButtonDelete({ target })
	if (target.dataset.role === 'editTask') onClickButtonEdit({ target })
}

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

	Task.setDataToLocalStorage(data)
	Task.render(data)
}

function onClickButtonEdit({ target }) {

	// Ищем изменяемую таску, передаём её данные в инпуты формы (модалка изменения таски)

	const targetTask = data.find((task) => task.id === Task.getId({ target }))

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

	Task.setDataToLocalStorage(data)
	Task.render(data)
}

function onClickButtonDelete({ target }) {

	// Ищем нужную таску и вырезаем её

	const targetTask = data.find((task) => task.id === Task.getId({ target }))
	const targetIndexTask = data.indexOf(targetTask)
	data.splice(targetIndexTask, 1)

	Task.setDataToLocalStorage(data)
	Task.render(Task.getDataFromLocalStorage())
}

function onChangeSelectStatus({ target }) {

	// Первым if проверяем количество тасок "in progress" (если 6 - вызываем модалку-предупреждение)
	// Вторым if ищем нужную таску, меняем её статус

	const inProgressTasks = data.filter((task) => task.status === 'inProgress')

	if (inProgressTasks.length === 6 && target.value === 'inProgress') {
		warningMaxTasksModal.show()

	} else if (target.dataset.role === 'status') {
		if (inProgressTasks.length === 6 && target.value === 'inProgress') {
			warningMaxTasksModal.show()
		}
		const targetTask = data.find((task) => task.id === Task.getId({ target }))

		targetTask.status = target.value

		Task.setDataToLocalStorage(data)
		Task.render(Task.getDataFromLocalStorage())
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

		Task.setDataToLocalStorage(data)
		Task.render(Task.getDataFromLocalStorage())
	}

	deleteCompletedTasksModal.hide()
}

function handleSubmitSearchForm(event) {

	// Осуществляем поиск по таскам (ищем совпадения по заголовку, описанию и исполнителю)

	event.preventDefault()

	const { target } = event
	const formData = new FormData(target)
	const fromDataEntries = Object.fromEntries(formData.entries())
	const searchValue = fromDataEntries.searchValue

	const targetTask = Task.getDataFromLocalStorage().filter((task) => {
		let suitableTitle = task.title.toLowerCase().includes(searchValue.toLowerCase())
		let suitableDescription = task.description.toLowerCase().includes(searchValue.toLowerCase())
		let suitableUser = task.user.toLowerCase().includes(searchValue.toLowerCase())

		if (suitableTitle || suitableDescription || suitableUser) return task
	})

	formSearchTaskElement.reset()
	Task.render(targetTask)
}

function handleClickLogo() {
	location.reload()
}

// init
Users.getData('https://jsonplaceholder.typicode.com/users')
Task.render(data)
setInterval(getTime, 1000)