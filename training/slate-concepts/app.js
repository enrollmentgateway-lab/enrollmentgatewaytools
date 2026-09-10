(function () {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
  }

  function selectedValue(id) {
    const element = byId(id);
    return element ? element.value : '';
  }

  function sentenceCase(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  // Query example: unique people vs. application rows
  document.querySelectorAll('.mini-output-toggle').forEach(function (toggle) {
    const buttons = Array.from(toggle.querySelectorAll('.mini-output-choice'));
    const card = toggle.closest('.definition-card');
    if (!card) return;
    const views = Array.from(card.querySelectorAll('.mini-output-view, .mini-output-note'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const view = button.getAttribute('data-mini-output-view');
        buttons.forEach(function (candidate) {
          const active = candidate === button;
          candidate.classList.toggle('active', active);
          candidate.setAttribute('aria-pressed', String(active));
        });
        views.forEach(function (el) {
          el.hidden = el.getAttribute('data-mini-output-view') !== view;
        });
      });
    });
  });

  // Query or report practice
  const outputQuestions = [
    {
      prompt: '“How are Fall 2027 applications distributed across teaching sites?”',
      answer: 'report',
      feedback: 'Right. “Distributed” asks for grouped counts—a report.'
    },
    {
      prompt: '“Which applicants still need a payment reminder?”',
      answer: 'query',
      feedback: 'Right. Someone needs identifiable records for follow-up—a query.'
    },
    {
      prompt: '“Did Preview Day attendees apply at a higher rate?”',
      answer: 'report',
      feedback: 'Right. Comparing rates needs an aggregated report.'
    },
    {
      prompt: '“Who should receive the Phoenix admitted-student invitation?”',
      answer: 'query',
      feedback: 'Right. A communication needs a list of matching recipients—a query.'
    }
  ];
  let outputQuestionIndex = 0;
  let outputAdvanceTimer = null;
  const outputPrompt = byId('output-prompt');
  const outputFeedback = byId('output-feedback');
  const outputCurrent = byId('practice-current');
  const outputButtons = Array.from(document.querySelectorAll('[data-output-choice]'));

  function renderOutputQuestion() {
    const question = outputQuestions[outputQuestionIndex];
    if (!question || !outputPrompt) return;
    outputPrompt.textContent = question.prompt;
    outputCurrent.textContent = String(outputQuestionIndex + 1);
    outputFeedback.textContent = 'Choose the kind of answer this staff member needs.';
    outputFeedback.classList.remove('success');
    outputButtons.forEach(function (button) {
      button.disabled = false;
      button.classList.remove('correct', 'incorrect');
    });
  }

  outputButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (outputAdvanceTimer) return;
      const question = outputQuestions[outputQuestionIndex];
      const choice = button.getAttribute('data-output-choice');
      const isCorrect = choice === question.answer;
      button.classList.add(isCorrect ? 'correct' : 'incorrect');
      outputButtons.forEach(function (item) {
        item.disabled = true;
        if (item.getAttribute('data-output-choice') === question.answer) item.classList.add('correct');
      });
      outputFeedback.textContent = isCorrect ? question.feedback : 'Not quite. ' + question.feedback.replace('Right. ', '');
      outputFeedback.classList.add('success');
      outputAdvanceTimer = window.setTimeout(function () {
        outputQuestionIndex = (outputQuestionIndex + 1) % outputQuestions.length;
        outputAdvanceTimer = null;
        renderOutputQuestion();
      }, 1700);
    });
  });

  // Audience segmentation sandbox
  const segmentInputs = ['segment-population', 'segment-pipeline', 'segment-site'];

  function updateSegmentResult() {
    const result = byId('segment-result-text');
    if (!result) return;
    result.textContent = sentenceCase(selectedValue('segment-population')) + ' in the ' + selectedValue('segment-pipeline') + ' pipeline connected to ' + selectedValue('segment-site') + '.';
  }

  segmentInputs.forEach(function (id) {
    const input = byId(id);
    if (input) input.addEventListener('change', updateSegmentResult);
  });

  // Content block and merge-field explainer
  const messageDemo = document.querySelector('.message-demo');
  const legendButtons = Array.from(document.querySelectorAll('[data-message-highlight]'));
  if (messageDemo) messageDemo.setAttribute('data-highlight', 'block');
  legendButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const highlight = button.getAttribute('data-message-highlight');
      messageDemo.setAttribute('data-highlight', highlight);
      legendButtons.forEach(function (item) {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
    });
  });

  // Research request builder
  const requestInputs = [
    'request-decision',
    'request-unit',
    'request-group',
    'request-site',
    'request-time',
    'request-output',
    'request-breakdown'
  ];

  function groupPhrase(group) {
    return group === 'all matching records' ? 'that meet the stated criteria' : 'in the ' + group + ' group';
  }

  function sitePhrase(site) {
    return site === 'all teaching sites' ? 'across all teaching sites' : 'connected to ' + site;
  }

  function updateResearchRequest() {
    const destination = byId('generated-request');
    if (!destination) return;

    const decision = selectedValue('request-decision');
    const unit = selectedValue('request-unit');
    const group = selectedValue('request-group');
    const site = selectedValue('request-site');
    const time = selectedValue('request-time');
    const output = selectedValue('request-output');
    const breakdown = selectedValue('request-breakdown');
    const grouping = breakdown === 'no grouping'
      ? ''
      : output === 'count'
        ? ' Group the results by ' + breakdown + ' and show the total.'
        : ' Organize the list by ' + breakdown + '.';
    const ambiguityNote = unit === 'people' && ['application status', 'decision code'].includes(breakdown)
      ? ' If one person has multiple applications, explain how that person is counted.'
      : '';

    if (output === 'count') {
      destination.textContent = 'To ' + decision + ', please provide a count of ' + unit + ' ' + groupPhrase(group) + ' ' + time + ', ' + sitePhrase(site) + '.' + grouping + ambiguityNote + ' State the criteria used and confirm whether the total represents unique people or application records.';
    } else {
      destination.textContent = 'To ' + decision + ', please provide a list of ' + unit + ' ' + groupPhrase(group) + ' ' + time + ', ' + sitePhrase(site) + '.' + grouping + ambiguityNote + ' Include the fields needed to identify and act on each record, and state the criteria used.';
    }
  }

  requestInputs.forEach(function (id) {
    const input = byId(id);
    if (input) input.addEventListener('change', updateResearchRequest);
  });

  function fallbackCopy(textToCopy) {
    const area = document.createElement('textarea');
    area.value = textToCopy;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    return copied;
  }

  const copyButton = byId('copy-request');
  if (copyButton) {
    copyButton.addEventListener('click', function () {
      const textToCopy = byId('generated-request').textContent;
      const copyStatus = byId('copy-status');
      const buttonLabel = copyButton.querySelector('span');
      const success = function () {
        buttonLabel.textContent = 'Copied';
        copyStatus.textContent = 'Research request copied to clipboard.';
        window.setTimeout(function () { buttonLabel.textContent = 'Copy request'; }, 1600);
      };
      const failure = function () {
        copyStatus.textContent = 'Copy was unavailable. Select and copy the request text manually.';
        buttonLabel.textContent = 'Select text';
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(success).catch(function () {
          if (fallbackCopy(textToCopy)) success();
          else failure();
        });
      } else if (fallbackCopy(textToCopy)) {
        success();
      } else {
        failure();
      }
    });
  }

  // Practice with Claude: live feedback on a drafted research request
  (function () {
    const panel = byId('llm-practice');
    if (!panel) return;
    const input = byId('llm-practice-input');
    const askButton = byId('llm-practice-ask');
    const stopButton = byId('llm-practice-stop');
    const answer = byId('llm-practice-answer');
    const status = byId('llm-practice-status');
    let sample = null;
    let controller = null;

    const FORMULA_GUIDE = 'A strong Slate research request names five things: (1) Decision — what the requester will do with the answer; (2) Unit — whether the count/list is of people or applications; (3) Criteria — the population or filter (for example, active applicants, admitted students, or a specific teaching site); (4) Timeframe — the term or cycle and an "as of" date; (5) Output — whether a count/report or a list/query is wanted, and how results should be grouped.';

    function setStatus(text, isError) {
      status.textContent = text;
      status.classList.toggle('error', Boolean(isError));
    }

    function setBusy(busy) {
      askButton.disabled = busy;
      input.disabled = busy;
      stopButton.hidden = !busy;
    }

    async function ask() {
      const draft = input.value.trim();
      if (!draft) {
        setStatus('Write a request first.', true);
        return;
      }
      if (!sample) return;

      controller = new AbortController();
      setBusy(true);
      setStatus('Thinking…');
      answer.hidden = true;
      answer.textContent = '';

      const prompt = 'You are a friendly Slate research partner at a graduate seminary’s admissions office, reviewing a colleague’s draft data request before it goes to the Slate reporting team.\n\n'
        + FORMULA_GUIDE + '\n\n'
        + 'Here is their draft request:\n"' + draft + '"\n\n'
        + 'In under 120 words: note what’s already clear, name anything missing or ambiguous from the five parts above, and end with one rewritten version of the request that fixes it. Be specific and encouraging, not preachy.';

      try {
        const result = await sample(prompt, {
          modelTier: 'quick',
          cache: false,
          signal: controller.signal,
          onText: function (update) {
            answer.hidden = false;
            answer.textContent = update.text;
          }
        });
        setStatus(result.truncated ? 'Cut short — try a shorter request.' : '');
      } catch (error) {
        if (error.text) {
          answer.hidden = false;
          answer.textContent = error.text;
        }
        if (error.code === 'cancelled') {
          setStatus('Stopped.');
        } else if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(error.code)) {
          panel.hidden = true;
        } else if (error.code === 'rate_limited') {
          setStatus('Too many requests right now — try again in a moment.', true);
        } else if (error.code === 'refused') {
          answer.hidden = true;
          setStatus('Claude declined to answer that one — try rephrasing.', true);
        } else {
          setStatus('Something went wrong — try again.', true);
        }
      } finally {
        setBusy(false);
        controller = null;
      }
    }

    askButton.addEventListener('click', ask);
    stopButton.addEventListener('click', function () {
      if (controller) controller.abort();
    });

    if (window.claude && typeof window.claude.use === 'function') {
      window.claude.use('sample').then(function (namespace) {
        if (!namespace) return;
        sample = namespace;
        panel.hidden = false;
      }).catch(function () {});
    }
  }());

  // Accessible sample-report tabs
  const reportTabs = Array.from(document.querySelectorAll('.report-tabs [role="tab"]'));

  function selectReportTab(selectedTab, moveFocus) {
    reportTabs.forEach(function (tab) {
      const selected = tab === selectedTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      const panel = byId(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (moveFocus) selectedTab.focus();
  }

  reportTabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectReportTab(tab, false); });
    tab.addEventListener('keydown', function (event) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + reportTabs.length) % reportTabs.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % reportTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = reportTabs.length - 1;
      selectReportTab(reportTabs[nextIndex], true);
    });
  });

  // Report-interpretation accordions
  document.querySelectorAll('.conclusion-list button').forEach(function (button) {
    button.addEventListener('click', function () {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      const answer = button.nextElementSibling;
      if (answer) answer.hidden = expanded;
    });
  });

  // Decision-code breakdown accordions
  document.querySelectorAll('.decision-code').forEach(function (button) {
    button.addEventListener('click', function () {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      const detail = byId(button.getAttribute('aria-controls'));
      if (detail) detail.hidden = expanded;
    });
  });

  // Status-ladder detail panels
  const personStatusDetails = {
    'Inquiries': 'The person has expressed interest and is recorded as an inquiry. No application exists yet.',
    'Prospect': 'Interest has been qualified further, but the person has not yet started an application.',
    'App': 'The person has at least one application in progress or decided.',
    'Student': 'The person has enrolled in at least one program.',
    'Graduate': 'The person has completed a program. Person status does not reverse even if the person shows new interest later.'
  };
  const applicationStatusDetails = {
    'Awaiting Submission': 'The application has been started but not yet submitted for review.',
    'Awaiting Payment': 'The application has been submitted; the application fee has not yet been received.',
    'Awaiting Materials': 'The fee has been paid, but required supporting materials—transcripts, recommendations, and similar items—are still outstanding.',
    'Decided': 'All required materials are in and a decision code (Admit, Admit Provisional, or Deny) has been recorded.'
  };

  function wireStatusLadder(listSelector, details) {
    const list = document.querySelector(listSelector);
    if (!list) return;
    const detail = list.parentElement.querySelector('.status-detail');
    const items = Array.from(list.querySelectorAll('li[data-status]'));

    function select(item) {
      items.forEach(function (candidate) { candidate.classList.toggle('selected', candidate === item); });
      if (detail) detail.textContent = details[item.getAttribute('data-status')] || '';
    }

    items.forEach(function (item) {
      item.addEventListener('click', function () { select(item); });
      item.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        select(item);
      });
    });
  }

  wireStatusLadder('.person-status-line', personStatusDetails);
  wireStatusLadder('.application-status-list', applicationStatusDetails);

  // Knowledge check
  const quizForm = byId('quiz-form');
  const resetQuiz = byId('reset-quiz');
  const quizResult = byId('quiz-result');

  if (quizForm) {
    quizForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const questions = Array.from(quizForm.querySelectorAll('fieldset'));
      const unanswered = questions.find(function (question) {
        return !question.querySelector('input:checked');
      });

      if (unanswered) {
        quizResult.hidden = false;
        quizResult.innerHTML = '<strong>Almost ready.</strong><p>Choose an answer for every scenario, then check your thinking.</p>';
        unanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const firstInput = unanswered.querySelector('input');
        if (firstInput) firstInput.focus({ preventScroll: true });
        return;
      }

      let score = 0;
      questions.forEach(function (question) {
        const answer = question.getAttribute('data-answer');
        const checked = question.querySelector('input:checked');
        const correct = checked && checked.value === answer;
        if (correct) score += 1;
        question.classList.toggle('correct', correct);
        question.classList.toggle('incorrect', !correct);
        const explanation = question.querySelector('.quiz-explanation');
        if (explanation) explanation.hidden = false;
        const bonus = question.querySelector('.quiz-bonus');
        if (bonus) bonus.hidden = !checked || checked.value !== bonus.getAttribute('data-bonus-for');
      });

      const message = score === questions.length
        ? 'You kept the output, record, audience, and denominator distinct.'
        : score >= 4
          ? 'Strong foundation. Review the explanations on the scenarios you missed.'
          : 'Review the marked explanations, then try the scenarios again.';
      quizResult.innerHTML = '<strong>' + score + ' of ' + questions.length + ' correct</strong><p>' + message + '</p>';
      quizResult.hidden = false;
      resetQuiz.hidden = false;
      quizResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  if (resetQuiz) {
    resetQuiz.addEventListener('click', function () {
      quizForm.reset();
      quizForm.querySelectorAll('fieldset').forEach(function (question) {
        question.classList.remove('correct', 'incorrect');
        const explanation = question.querySelector('.quiz-explanation');
        if (explanation) explanation.hidden = true;
        const bonus = question.querySelector('.quiz-bonus');
        if (bonus) bonus.hidden = true;
      });
      quizResult.hidden = true;
      quizResult.textContent = '';
      resetQuiz.hidden = true;
      const firstInput = quizForm.querySelector('input');
      if (firstInput) firstInput.focus();
    });
  }

  // Searchable glossary
  const glossarySearch = byId('glossary-search');
  const glossaryEntries = Array.from(document.querySelectorAll('#glossary-grid article'));
  const glossaryEmpty = byId('glossary-empty');

  if (glossarySearch) {
    glossarySearch.addEventListener('input', function () {
      const search = glossarySearch.value.trim().toLowerCase();
      let visible = 0;
      glossaryEntries.forEach(function (entry) {
        const haystack = (entry.textContent + ' ' + (entry.getAttribute('data-search') || '')).toLowerCase();
        const matches = !search || haystack.includes(search);
        entry.hidden = !matches;
        if (matches) visible += 1;
      });
      glossaryEmpty.hidden = visible > 0;
    });
  }

  // Section progress and active navigation
  const lessonSections = Array.from(document.querySelectorAll('.lesson-section[data-section]'));
  const navLinks = Array.from(document.querySelectorAll('.lesson-nav a'));
  const viewedSections = new Set();
  const progressBar = byId('progress-bar');
  const progressValue = byId('progress-value');

  function updateProgress() {
    const percentage = lessonSections.length ? Math.round(viewedSections.size / lessonSections.length * 100) : 0;
    if (progressBar) progressBar.style.width = percentage + '%';
    if (progressValue) progressValue.textContent = percentage + '%';
  }

  function setActiveSection(id) {
    navLinks.forEach(function (link) {
      const active = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    const completionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        viewedSections.add(entry.target.getAttribute('data-section'));
        updateProgress();
      });
    }, { threshold: .15 });

    const navigationObserver = new IntersectionObserver(function (entries) {
      const visible = entries.filter(function (entry) { return entry.isIntersecting; });
      if (!visible.length) return;
      visible.sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      setActiveSection(visible[0].target.id);
    }, { rootMargin: '-12% 0px -66% 0px', threshold: [0, .2, .5] });

    lessonSections.forEach(function (section) {
      completionObserver.observe(section);
      navigationObserver.observe(section);
    });
  } else {
    lessonSections.forEach(function (section) { viewedSections.add(section.getAttribute('data-section')); });
    updateProgress();
  }

  renderOutputQuestion();
  updateSegmentResult();
  updateResearchRequest();
}());
