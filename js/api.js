export class API {

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

    getContributorsResult = (repoPath) => {

        return this.getData(`${this.URL}/repos/${repoPath}/contributors`);

    }
}