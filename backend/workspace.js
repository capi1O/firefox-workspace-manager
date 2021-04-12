class Workspace {
  constructor(id, state) {
    this.id = id;
    this.name = state.name;
    this.active = state.active;
    this.tabs = state.tabs;
    this.windowId = state.windowId;
  }

  static async create(id, state) {
    const wspId = id || Date.now();

    const wsp = new Workspace(wspId, state);

    await wsp._saveState();
    await WSPStorageManger.addWsp(wspId, state.windowId);

    return wsp;
  }

  static async getWorkspaces(windowId) {
    return await WSPStorageManger.getWorkspaces(windowId);
  }

  async destroy() {
    if (this.tabs.length > 0) {
      await browser.tabs.remove(this.tabs);
    }
    await WSPStorageManger.deleteWspState(this.id);
    await WSPStorageManger.removeWsp(this.id, this.windowId);
  }

  async activate() {
    if (this.tabs.length > 0) {
      await browser.tabs.show(this.tabs);
      await browser.tabs.update(this.tabs[0], { active: true });
    }
    
    this.active = true;
    await this._saveState();
  }

  async hideTabs() {
    this.active = false;
    
    await browser.tabs.hide(this.tabs);

    await this._saveState();
  }

  static async rename(wspId, wspName) {
    const state = await WSPStorageManger.getWspState(wspId);

    state.name = wspName;

    const wsp = new Workspace(wspId, state);

    await wsp._saveState();
  }

  async _saveState() {
    await WSPStorageManger.saveWspState(this.id, {
      id: this.id,
      name: this.name,
      active: this.active,
      tabs: this.tabs,
      windowId: this.windowId
    });
  }
}