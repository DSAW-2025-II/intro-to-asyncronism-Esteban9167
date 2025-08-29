const dateNumber = document.getElementById('dateNumber');
const dateText   = document.getElementById('dateText');
const dateMonth  = document.getElementById('dateMonth');
const dateYear   = document.getElementById('dateYear');

const tasksContainer = document.getElementById('tasksContainer');

function setDate() {
  const now = new Date();
  dateNumber.textContent = now.toLocaleString('es', { day: 'numeric' });
  dateText.textContent   = now.toLocaleString('es', { weekday: 'long' }).toUpperCase();
  dateMonth.textContent  = now.toLocaleString('es', { month: 'short' });
  dateYear.textContent   = now.toLocaleString('es', { year: 'numeric' });
}

function addNewTask(event) {
  event.preventDefault();
  const input = event.target.taskText;
  const value = (input?.value || '').trim();
  if (!value) return;

  const task = document.createElement('div');
  task.classList.add('task', 'roundBorder');

  const text = document.createElement('span');
  text.textContent = value;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'removeButton';
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', (ev) => {
    ev.stopPropagation(); 
    task.remove();
  });

  task.append(text, removeBtn);
  task.addEventListener('click', changeTaskState);

  tasksContainer.prepend(task);
  event.target.reset();
}

function changeTaskState(event) {
  event.currentTarget.classList.toggle('done');
}

function order() {
  const done = [];
  const toDo = [];
  Array.from(tasksContainer.children).forEach((el) => {
    el.classList.contains('done') ? done.push(el) : toDo.push(el);
  });
  return [...toDo, ...done];
}

function renderOrderedTasks() {
  order().forEach((el) => tasksContainer.appendChild(el));
}

window.addEventListener('DOMContentLoaded', setDate);

window.addNewTask = addNewTask;
window.renderOrderedTasks = renderOrderedTasks;
