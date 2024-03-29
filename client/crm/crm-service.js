import { BaseService } from "../js/base-service.js";
export class CRMService extends BaseService {
  getAllTaskList(project_id = 11) {
    let options = {
      // orderby: '"ToDoByDate asc"',
      ListType: "Detail",
      // select: "[Active]=true and [Completed]=false and [ProjectID]=0"
      select: "[Active]=true",
    };
    return this.getList(this.ERPObjects.Tprojecttasks, options);
  }

  getTasksByNameOrID(dataSearchName) {
    let options = {
      ListType: "Detail",
      select:
        '[Active]=true and [TaskName] f7like "' +
        dataSearchName +
        '" OR [ID] f7like "' +
        dataSearchName +
        '"',
    };
    return this.getList(this.ERPObjects.Tprojecttasks, options);
  }

  getTaskDetail(id) {
    return this.getOneById(this.ERPObjects.Tprojecttasks, id);
  }

  saveNewTask(data) {
    return this.POST(this.ERPObjects.Tprojecttasks, data);
  }

  getTProjectList() {
    let options = {
      ListType: "Detail",
      // select: "[Active]=true"
    };
    return this.getList(this.ERPObjects.Tprojectlist, options);
  }

  getProjectsByNameOrID(dataSearchName) {
    let options = {
      ListType: "Detail",
      select:
        '[ProjectName] f7like "' +
        dataSearchName +
        '" OR [ID] f7like "' +
        dataSearchName +
        '"',
    };
    return this.getList(this.ERPObjects.Tprojectlist, options);
  }

  getTProjectDetail(id) {
    return this.getOneById(this.ERPObjects.Tprojectlist, id);
  }

  updateProject(data) {
    return this.POST(this.ERPObjects.Tprojectlist, data);
  }

  getAllLabels() {
    let options = {
      ListType: "Detail",
      select: "[Active]=true",
    };
    return this.getList(this.ERPObjects.Tprojecttask_TaskLabel, options);
  }

  getLabelsByNameOrID(dataSearchName) {
    let options = {
      ListType: "Detail",
      select:
        '[Active]=true and [TaskLabelName] f7like "' +
        dataSearchName +
        '" OR [ID] f7like "' +
        dataSearchName +
        '"',
    };
    return this.getList(this.ERPObjects.Tprojecttask_TaskLabel, options);
  }

  getOneLabel(id) {
    return this.getOneById(this.ERPObjects.Tprojecttask_TaskLabel, id);
  }

  updateLabel(data) {
    return this.POST(this.ERPObjects.Tprojecttask_TaskLabel, data);
  }

  getTTodoTaskList() {
    let options = {
      orderby: '"ToDoByDate asc"',
      ListType: "Detail",
      select: "[Active]=true and [Completed]=false and [Done]=false",
      // select: "[Active]=true and [Completed]=false and [EmployeeID]=" + employeeID
    };
    return this.getList(this.ERPObjects.TToDo, options);
  }

  getOneTTodoTask(id) {
    return this.getOneById(this.ERPObjects.TToDo, id);
  }

  saveComment(data) {
    return this.POST(this.ERPObjects.Tprojecttask_comments, data);
  }

  getAllFilters() {
    return;
  }
}
