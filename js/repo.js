let repoTitle = document.querySelector('.repo__title'),
userImg = document.querySelector('.repo__img img'),
userNickname = document.querySelector('.repo__nickname'),
userListText = document.querySelector('.repo-list__text'),
userStars = document.querySelector('.repo-stars'),
userDescription = document.querySelector('.repo-description'),
userContributorsHeader = document.querySelector('.repo-contributors__header'),
userContributorsList = document.querySelector('.repo-contributors__list');



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

    getContributorsResult = (repoPath) => {

        return this.getData(`${this.URL}/repos/${repoPath}/contributors`);

    }

}


let repoData = JSON.parse(localStorage.getItem('repoInfo'));

// По полному названию репозитория находим его контрибьютеров 
new API().getContributorsResult(repoData.fullName).then(getTopContributors);

// Заполняем все данные на странице

let {

    fullName,
    avatarURL,
    owner,
    stars,
    language,
    description

} = repoData;


repoTitle.textContent = fullName;
userImg.src = avatarURL;
userNickname.textContent = owner;
userStars.textContent = stars + ' stars';
userListText.textContent = language? language : "Language not specified";
userDescription.textContent = description? description : "No description";


// Создаем 10 самых активных контрибьюторов
function getTopContributors(contributors) {

    userContributorsHeader.textContent = 'Top contributors:';

    
    for (let i = 0; i < 10; i++) {

        let contributor = document.createElement('li');
        contributor.textContent = contributors[i].login;

        userContributorsList.append(contributor);

    }

}

