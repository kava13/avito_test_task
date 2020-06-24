let searchForm = document.querySelector('.search-form'),
    searchInput = document.querySelector('.search-input'),
    searchButton = document.querySelector('.search-button'),
    repositoriesBlock = document.querySelector('.repositories-block'),
    repositoriesList = document.querySelector('.repositories-list'),
    paginationWrapper = document.querySelector('.pagination-wrapper'),
    userTitle = document.querySelector('.user__title'),
    userBlock = document.querySelector('.user-block');





const API = class {

    constructor() {

        this.URL = 'https://api.github.com';
        this.USER_PER_PAGE = 10;

    }

    getData = async (url) => {
        const res = await fetch(url);

        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Not enought data from : ${url}`);
        }
    }

    getSearchResult = (query, page) => {
        return this.getData(`${this.URL}/search/repositories?q=${query}&per_page=${this.USER_PER_PAGE}&page=${page}&sort=stars`);

    }

    getStartResult = (page) => {
        return this.getData(`${this.URL}/search/repositories?q=stars:%3E=1&sort=stars&order=desc&per_page=${this.USER_PER_PAGE}&page=${page}`);
    }

    getRepoResult = (repoPath) => {
        return this.getData(`${this.URL}/repos/${repoPath}`);
    }

}


let value;
let prevPage;

// Проверяем, был ли произведен запрос ранее
// Если да, то выполняем поиск + делаем пагинацию
// иначе (если впервые зашли или localStorage.clear(), выводятся популярные)
if (localStorage.getItem('searchValue') && localStorage.getItem('searchPage')) {

    searchInput.value = localStorage.getItem('searchValue');
    value = localStorage.getItem('searchValue');
    prevPage = localStorage.getItem('searchPage');

    new API().getSearchResult(value, prevPage).then(renderRepositories);
    new API().getSearchResult(value, 1).then(createPagination);

} else {

    new API().getStartResult(1).then(renderRepositories);
    new API().getStartResult().then(createPagination);
}

// Создает репозитории после получения Promise
function renderRepositories(response) {

    console.log(response);


    response.items.forEach(item => {

        const {
            full_name: name,
            stargazers_count: stars,
            updated_at: updateDate,
            html_url: link
        } = item;


        let repoCard = document.createElement('li');
        repoCard.classList.add('repositories-list__item');

        repoCard.innerHTML = `<div class="repositories-list__text">
                                <a href="#" class="repositories-list__link">${name}</a>
                                <span class="repositories-list__updated"> Last update: ${updateDate.slice(0, 10)}</span>
                            </div>
                            <div class="repositories-list__stats">
                                <div class="repositories-list__stars">
                                    <img src="img/star.png" alt="">
                                    <span>${stars}</span>
                                </div>
                            </div>`;

        repositoriesList.append(repoCard);

    });

}

// Создаем пагинацию
function createPagination(response) {

    // Здесь стоит отметить, что GitHub API может написать, что результата поиска
    // 30.000, но предоставит в доступ он только первые 100

    // Определяем сколько результатов поиска
    let searchResults = response['total_count'];

    const MAX_AVAILABLE = 100;
    const MAX_PAGES = 10;

    // Если их больше 100, создаем 10 страниц пагинации, иначе меньше
    // например, при 26 результатах будет 3 страницы 

    if (searchResults > MAX_AVAILABLE) {

        createPaginationItems(MAX_PAGES);

    } else {

        let pagesNumber = Math.ceil(searchResults / 10);

        createPaginationItems(pagesNumber);

    }

    function createPaginationItems(pages) {

        // Если в localStorage есть данные о предыдущей странице, то
        // выделяем ее как активную. Иначе выделяем первую страницу
        let currentValue = searchInput.value;
        let currentPage = 0;

        if (prevPage && currentValue) {
            currentPage = parseInt(prevPage) - 1;
        }

        console.log(currentPage);
        




        paginationWrapper.textContent = ' ';

        for (let i = 0; i < pages; i++) {

            let pagItem = document.createElement('div');
            pagItem.classList.add('pagination-wrapper__item');

            if (i === currentPage) {

                console.log('da');
                

                pagItem.classList.add('pagination-wrapper__active');

            }

            pagItem.textContent = i + 1;
            paginationWrapper.append(pagItem);

        }

    }

}

// Занесение в localStorage информации по выбранному репозиторию
function createRepoCard(response) {

    let repoData = {

        fullName: response['full_name'],
        avatarURL: response.owner['avatar_url'],
        owner: response.owner.login,
        stars: response['stargazers_count'],
        language: response['language'],
        description: response['description']


    }


    localStorage.setItem('repoInfo', JSON.stringify(repoData));

    // Данные для создания карточки занесены, идем на другую страницу

    document.location.href = "/repo.html";

}

function clearRepositoriesList() {

    repositoriesList.textContent = ' ';

}




// Поиск при нажатии enter
searchForm.addEventListener('submit', (event) => {

    event.preventDefault();

    clearRepositoriesList();

    value = searchInput.value;

    localStorage.setItem('searchValue', value);
    localStorage.setItem('searchPage', 1);

    // Если что-то ввели, то поиск, а если ввели ничего, то открываются
    // популярные репозитории

    if (value) {

        // Заполняем список репозиториев 
        new API().getSearchResult(value, 1).then(renderRepositories);

        // Сбрасываем пагинацию на первую страницу
        new API().getSearchResult(value, 1).then(createPagination);

    } else {

        new API().getStartResult(1).then(renderRepositories);
        new API().getStartResult().then(createPagination);

    }



})

// Изменение страницы и результатов поиска в пагинации
paginationWrapper.addEventListener('click', (event) => {

    if (event.target.classList.contains('pagination-wrapper__item')) {

        let pageNumber = event.target.textContent;
        localStorage.setItem('searchPage', pageNumber);

        clearRepositoriesList();

        // Если мы жмем на страницу в пагинации, когда уже был произведен поиск,
        // то рендерится страница с последним сохраненным результатом,
        // иначе страница с популярными репозиториями
        if (value) {

            new API().getSearchResult(value, pageNumber).then(renderRepositories);

        } else {

            new API().getStartResult(pageNumber).then(renderRepositories);

        }

        let pagItems = document.querySelectorAll('.pagination-wrapper__item');

        // Делаем выбранную страницу активной
        pagItems.forEach((element) => {

            element.classList.remove('pagination-wrapper__active');

        })

        event.target.classList.add('pagination-wrapper__active');

    }

})

// При клике по названию репозитория начинаем составлять карточку на странице repo.html
repositoriesList.addEventListener('click', (event) => {

    if (event.target.closest('.repositories-list__link')) {

        let fullRepoName = event.target.textContent;

        // Осуществляем обращение к API по названию репозитория,
        // чтобы занести их в localStorage 
        // и зарендерить на другой странице карточку репозитория

        new API().getRepoResult(fullRepoName).then(createRepoCard);

    }

})

// Вывод популярных репозиториев при нажатии на кнопку
searchButton.addEventListener('click', (event) => {

    event.preventDefault();

    localStorage.clear();
    prevPage = 0;
    searchInput.value = ' ';
    clearRepositoriesList();
    new API().getStartResult(1).then(renderRepositories);
    new API().getStartResult().then(createPagination);
    
})