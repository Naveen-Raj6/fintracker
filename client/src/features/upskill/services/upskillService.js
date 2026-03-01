import api from '../../../utils/api';

const API_URL = '/upskill/';

const getUpskillProjects = async () => {
    const response = await api.get(API_URL);
    return response.data;
};

const addUpskillProject = async (projectData) => {
    const response = await api.post(API_URL, projectData);
    return response.data;
};

const addSession = async ({ id, sessionData }) => {
    const response = await api.put(`${API_URL}${id}/session`, sessionData);
    return response.data;
};

const deleteProject = async (projectId) => {
    const response = await api.delete(API_URL + projectId);
    return response.data;
};

const toggleMilestone = async ({ projectId, milestoneId }) => {
    const response = await api.put(`${API_URL}${projectId}/milestone/${milestoneId}`);
    return response.data;
};

const upskillService = {
    getUpskillProjects,
    addUpskillProject,
    addSession,
    toggleMilestone,
    deleteProject,
};

export default upskillService;
