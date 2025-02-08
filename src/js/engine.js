const engine = syngen

// Add triggering event to FSM event handling
engine.tool.fsm.prototype.change = function (state, data = {}) {
  if (!(state in this.transition) || this.is(state)) {
    return this
  }

  const exitPayload = {
    currentState: this.state,
    event: this._lastEvent,
    nextState: state,
    ...data,
  }

  this.pubsub.emit('exit', exitPayload)
  this.pubsub.emit(`exit-${this.state}`, exitPayload)

  const enterPayload = {
    currentState: state,
    event: this._lastEvent,
    previousState: this.state,
    ...data,
  }

  this.setState(state)

  this.pubsub.emit('enter', enterPayload)
  this.pubsub.emit(`enter-${this.state}`, enterPayload)

  return this
}

engine.tool.fsm.prototype.dispatch = function (event, data = {}) {
  const actions = this.transition[this.state]

  if (!actions) {
    return this
  }

  const action = actions[event]

  if (action) {
    const state = this.state

    const beforePayload = {
      event,
      state,
      ...data,
    }

    this.pubsub.emit('before', beforePayload)
    this.pubsub.emit(`before-${event}`, beforePayload)
    this.pubsub.emit(`before-${state}-${event}`, beforePayload)

    this._lastEvent = event
    action.call(this, data)
    delete this._lastEvent

    const afterPayload = {
      currentState: this.state,
      event,
      previousState: state,
      ...data,
    }

    this.pubsub.emit('after', afterPayload)
    this.pubsub.emit(`after-${event}`, afterPayload)
    this.pubsub.emit(`after-${state}-${event}`, afterPayload)
  }

  return this
}
