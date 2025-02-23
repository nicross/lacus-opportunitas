content.tricks = (() => {
  const types = [
    'trick1',
    'trick2',
    'trick3',
  ]

  const machine = engine.tool.fsm.create({
    state: 'inactive',
    transition: {
      inactive: {
        trick: function () {
          this.change('trick')
        },
      },
      trick: {
        fail: function () {
          this.change('inactive')
        },
        success: function () {
          this.change('inactive')
        },
      },
    },
  })

  const handlers = {
    inactive: (input) => {
      if (!content.movement.isJump()) {
        if (input.trick1 || input.trick2 || input.trick3) {
          machine.pubsub.emit('inactive-disallowed')
        }

        if (run) {
          endRun()
        }

        return
      }

      for (const type of types) {
        if (input[type]) {
          if (!run) {
            startRun()
          }

          trick = {
            duration: 0,
            type,
          }

          return machine.dispatch('trick')
        }
      }
    },
    trick: (input) => {
      if (!input[trick.type]) {
        endTrick()
        return machine.dispatch('success')
      }

      if (!content.movement.isJump()) {
        return machine.dispatch('fail')
      }

      trick.duration += engine.loop.delta()
    },
  }

  let run,
    trick

  function endRun() {
    if (!run.count) {
      run = undefined
      return
    }

    const idealWeight = 1 / types.length

    run.end = content.time.value()
    run.duration = run.end - run.start
    run.activeRatio = engine.fn.clamp(run.activeDuration / run.duration)
    run.score = 0

    for (const type of types) {
      run[type].countRatio = run[type].count / run.count
      run[type].durationRatio = run[type].duration / run.activeDuration

      run[type].scoreWeight = run[type].durationRatio < idealWeight
        ? engine.fn.scale(run[type].durationRatio, 0, idealWeight, idealWeight, 1)
        : engine.fn.scale(run[type].durationRatio, idealWeight, 1, 1, idealWeight)

      run.score += (run[type].longest + Math.max(0, run[type].count - 1)) * run[type].scoreWeight
    }

    run.score *= 1 + content.ports.averageTransactionLevel()
    run.score = Math.ceil(run.score)

    machine.pubsub.emit('end-run', run)

    run = undefined
  }

  function endTrick() {
    const {
      duration,
      type,
    } = trick

    run.activeDuration += duration
    run.count += 1
    run.longest = Math.max(run.longest, duration)

    run[type].count += 1
    run[type].duration += duration
    run[type].longest = Math.max(run[type].longest, duration)

    trick = undefined
  }

  function startRun() {
    machine.pubsub.emit('start-run')

    run = {
      activeDuration: 0,
      count: 0,
      end: undefined,
      longest: 0,
      start: content.time.value(),
      trick1: {
        count: 0,
        duration: 0,
        longest: 0,
      },
      trick2: {
        count: 0,
        duration: 0,
        longest: 0,
      },
      trick3: {
        count: 0,
        duration: 0,
        longest: 0,
      },
    }
  }

  return machine.pubsub.decorate({
    isActive: () => !machine.is('inactive') || typeof run != 'undefined',
    reset: function () {
      machine.state = 'inactive'

      trick = undefined
      run = undefined

      return this
    },
    run: () => ({...run}),
    trick: () => ({...trick}),
    update: function (input = {}) {
      handlers[machine.state](input)

      return this
    },
  })
})()

engine.state.on('reset', () => content.tricks.reset())
