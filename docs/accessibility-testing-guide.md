# Accessibility Testing Guide

This guide provides comprehensive instructions for testing the Freelancian MVP application with accessibility tools and screen readers.

## 🎯 Quick Testing Checklist

### Automated Testing
- [ ] Run built-in accessibility checker (95%+ score)
- [ ] Validate color contrast ratios (4.5:1 minimum)
- [ ] Check keyboard navigation flow
- [ ] Verify ARIA attributes
- [ ] Test focus management

### Manual Testing
- [ ] Keyboard-only navigation
- [ ] Screen reader compatibility
- [ ] High contrast mode
- [ ] Reduced motion preferences
- [ ] Touch interaction (44px targets)

## 🔧 Testing Tools

### Browser Extensions
1. **axe DevTools** (Chrome/Firefox)
   - Install from browser store
   - Open DevTools → axe tab
   - Run full accessibility scan

2. **WAVE** (Chrome/Firefox)
   - Install WAVE extension
   - Click WAVE icon on any page
   - Review errors, alerts, and features

3. **Lighthouse** (Built into Chrome)
   - Open DevTools → Lighthouse tab
   - Select "Accessibility" category
   - Generate report

### Desktop Screen Readers

#### NVDA (Windows - Free)
1. **Installation:**
   ```
   Download from: https://www.nvaccess.org/download/
   Install and restart computer
   ```

2. **Basic Commands:**
   - `Ctrl + Alt + N` - Start/Stop NVDA
   - `Insert + Space` - Toggle browse/focus mode
   - `H` - Navigate by headings
   - `D` - Navigate by landmarks
   - `F` - Navigate by form fields
   - `B` - Navigate by buttons
   - `L` - Navigate by links

3. **Testing Steps:**
   ```
   1. Start NVDA
   2. Navigate to http://localhost:3000
   3. Use H key to navigate headings
   4. Use D key to navigate landmarks
   5. Use Tab to navigate interactive elements
   6. Test form completion with F key
   7. Verify announcements for dynamic content
   ```

#### JAWS (Windows - Commercial)
1. **Installation:**
   ```
   Download 40-minute demo from:
   https://www.freedomscientific.com/products/software/jaws/
   ```

2. **Basic Commands:**
   - `Insert + J` - Start JAWS
   - `Insert + F12` - Stop JAWS
   - `H` - Navigate by headings
   - `R` - Navigate by regions/landmarks
   - `F` - Navigate by form fields
   - `B` - Navigate by buttons

#### VoiceOver (macOS - Built-in)
1. **Activation:**
   ```
   System Preferences → Accessibility → VoiceOver → Enable
   Or: Cmd + F5
   ```

2. **Basic Commands:**
   - `Ctrl + Option + Right/Left` - Navigate elements
   - `Ctrl + Option + Cmd + H` - Navigate by headings
   - `Ctrl + Option + U` - Open rotor
   - `Ctrl + Option + Space` - Activate element

### Mobile Screen Readers

#### TalkBack (Android)
1. **Activation:**
   ```
   Settings → Accessibility → TalkBack → On
   ```

2. **Basic Gestures:**
   - Swipe right/left - Navigate elements
   - Double tap - Activate element
   - Two-finger swipe up - Read from top
   - Explore by touch - Move finger around screen

#### VoiceOver (iOS)
1. **Activation:**
   ```
   Settings → Accessibility → VoiceOver → On
   ```

2. **Basic Gestures:**
   - Swipe right/left - Navigate elements
   - Double tap - Activate element
   - Three-finger swipe - Scroll
   - Rotor gesture - Change navigation mode

## 🧪 Testing Procedures

### 1. Automated Testing

#### Built-in Accessibility Checker
```javascript
// Navigate to any page
// Open accessibility settings (floating button)
// Click "Show Accessibility Checker"
// Click "Run Check"
// Review results and fix issues
```

#### Browser DevTools
```javascript
// Chrome DevTools
1. F12 → Lighthouse tab
2. Select "Accessibility" only
3. Click "Generate report"
4. Review score and recommendations

// Firefox DevTools
1. F12 → Accessibility tab
2. Click "Turn on accessibility features"
3. Review accessibility tree
4. Check for issues
```

### 2. Keyboard Navigation Testing

#### Test Sequence
```
1. Tab through all interactive elements
2. Verify focus indicators are visible
3. Test skip links (Tab to first skip link, Enter)
4. Navigate forms using Tab/Shift+Tab
5. Test modal focus trapping
6. Verify Escape key closes modals
7. Test custom keyboard shortcuts (Alt+K)
```

#### Expected Behavior
- All interactive elements reachable via Tab
- Focus indicators clearly visible
- Logical tab order (left-to-right, top-to-bottom)
- Skip links work and are visible on focus
- Modals trap focus within dialog
- Escape key closes modals and menus

### 3. Screen Reader Testing

#### NVDA Testing Script
```
1. Start NVDA (Ctrl + Alt + N)
2. Navigate to application
3. Test heading navigation (H key):
   - Should announce "Freelancian MVP heading level 1"
   - Navigate through all headings in order
4. Test landmark navigation (D key):
   - Should find main, navigation, header, footer
5. Test form navigation (F key):
   - Should announce field labels and types
   - Test error announcements
6. Test button navigation (B key):
   - Should announce button names and states
7. Test dynamic content:
   - Trigger loading states
   - Verify announcements for status changes
   - Test form validation messages
```

#### VoiceOver Testing Script
```
1. Enable VoiceOver (Cmd + F5)
2. Navigate to application
3. Use rotor (Ctrl + Option + U):
   - Select "Headings" - verify all headings present
   - Select "Landmarks" - verify page structure
   - Select "Form Controls" - test all inputs
4. Test navigation:
   - Ctrl + Option + Right/Left through all elements
   - Verify announcements are clear and helpful
5. Test interactions:
   - Form completion and submission
   - Modal opening and closing
   - Dynamic content updates
```

### 4. Color Contrast Testing

#### Manual Testing
```
1. Use browser zoom to 200%
2. Verify all text remains readable
3. Check focus indicators remain visible
4. Test in high contrast mode:
   - Windows: Alt + Left Shift + Print Screen
   - macOS: System Preferences → Accessibility → Display → Increase Contrast
```

#### Automated Testing
```javascript
// Built-in contrast checker
1. Open accessibility checker
2. Review contrast test results
3. Fix any failing ratios (minimum 4.5:1)
```

### 5. Mobile Accessibility Testing

#### Touch Target Testing
```
1. Test on actual mobile device
2. Verify all buttons are at least 44px
3. Check spacing between touch targets
4. Test with different finger sizes
```

#### Screen Reader Testing
```
1. Enable TalkBack (Android) or VoiceOver (iOS)
2. Navigate through app using swipe gestures
3. Test form completion
4. Verify announcements for dynamic content
5. Test custom gestures and shortcuts
```

## 📊 Testing Checklist

### WCAG 2.1 AA Compliance

#### Perceivable
- [ ] Text alternatives for images
- [ ] Captions for videos (if applicable)
- [ ] Color contrast minimum 4.5:1
- [ ] Text can resize to 200% without loss of functionality
- [ ] Images of text avoided where possible

#### Operable
- [ ] All functionality available via keyboard
- [ ] No seizure-inducing content
- [ ] Users can pause, stop, or hide moving content
- [ ] Skip links provided
- [ ] Page titles descriptive
- [ ] Focus order logical
- [ ] Focus indicators visible
- [ ] Context changes don't occur on focus

#### Understandable
- [ ] Page language identified
- [ ] Language changes identified
- [ ] Navigation consistent across pages
- [ ] Components identified consistently
- [ ] Input errors identified
- [ ] Labels and instructions provided
- [ ] Error suggestions provided

#### Robust
- [ ] Valid HTML markup
- [ ] Name, role, value available for UI components
- [ ] Status messages programmatically determinable

## 🐛 Common Issues and Solutions

### Issue: Focus Not Visible
**Solution:** Add CSS focus indicators
```css
*:focus-visible {
  outline: 2px solid #0284c7;
  outline-offset: 2px;
}
```

### Issue: Screen Reader Not Announcing Changes
**Solution:** Use live regions
```html
<div aria-live="polite" aria-atomic="true">
  Status updates appear here
</div>
```

### Issue: Form Errors Not Announced
**Solution:** Use aria-describedby and role="alert"
```html
<input aria-describedby="email-error" />
<div id="email-error" role="alert">
  Please enter a valid email
</div>
```

### Issue: Modal Focus Not Trapped
**Solution:** Implement focus trap
```javascript
// Focus first element when modal opens
// Trap Tab key within modal
// Restore focus when modal closes
```

## 📈 Testing Results

### Expected Scores
- **Lighthouse Accessibility:** 95-100%
- **Built-in Checker:** 95%+
- **axe DevTools:** 0 violations
- **WAVE:** 0 errors, minimal alerts

### Performance Benchmarks
- **Keyboard Navigation:** All elements reachable
- **Screen Reader:** All content announced clearly
- **Color Contrast:** All text meets 4.5:1 ratio
- **Touch Targets:** All buttons 44px minimum
- **Focus Management:** Proper trapping and restoration

## 🔄 Continuous Testing

### Development Workflow
1. Run automated tests before each commit
2. Test with keyboard navigation weekly
3. Screen reader testing for major features
4. User testing with actual disabled users quarterly

### Monitoring
- Set up accessibility monitoring in CI/CD
- Regular audits with external accessibility consultants
- User feedback collection for accessibility issues
- Performance monitoring for assistive technologies

## 📚 Additional Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

### Tools
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- [axe Browser Extensions](https://www.deque.com/axe/browser-extensions/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)

### Communities
- [WebAIM Discussion List](https://webaim.org/discussion/)
- [A11y Slack Community](https://web-a11y.slack.com/)
- [Accessibility Developer Guide](https://www.accessibility-developer-guide.com/)

---

**Note:** This testing should be performed regularly during development and before each release to ensure consistent accessibility compliance.