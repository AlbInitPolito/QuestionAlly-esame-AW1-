async function login(credentials) {
    const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify(credentials)
    });
    if(response.ok) {
        const user = await response.json();
        return user.name;
    }
    else{
            const error = await response.json();
            throw error;
    }
}

async function getUserInfo() {
    const response = await fetch('/api/sessions/current');
    const userInfo = await response.json();
    if(response.ok) return userInfo;
    else throw userInfo;
}

async function logout() {
    await fetch('/api/sessions/current', { method: 'DELETE' });
}

async function loadAllSurveys() {
    try{
        const response = await fetch('/api/surveys');
        if(response.ok) {
            const surveys = await response.json();
            return surveys;
        }
    }
    catch(error) { throw error; }
}

async function loadUserSurveys() {
    const response = await fetch('/api/user/surveys');
    if(response.ok) {
        const surveys = await response.json();
        return surveys;
    }
}

async function loadSurveyAnswers(id) {
    const response = await fetch('/api/surveys/answers/'+id);
    if(response.ok) {
        const answers = await response.json();
        return answers;
    }
}

async function loadSurvey(id) {
    const response = await fetch('/api/surveys/'+id);
    if(response.ok) {
        const survey = await response.json();
        return survey;
    }
}

async function teapotEasterEgg() {
    const response = await fetch('/api/teapot');
    return response.json();
}

async function addCompiling(id, name, answers) {
    try{
        const response = await fetch('/api/surveys/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({surveyId: id, name: name, answers: answers})
        });
        return response.json();
    }
    catch(error){
        throw error;
    }
}

async function addSurvey(title, questions) {
    try{
        const response = await fetch('/api/surveys/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({title: title, questions: questions})
        });
        return response.json();
    }
    catch(error){
        throw error;
    }
}

const API = { login, getUserInfo, logout, loadAllSurveys, loadUserSurveys, loadSurvey, teapotEasterEgg, addCompiling, loadSurveyAnswers, addSurvey };
export default API;