import { test, expect } from '@playwright/test';

test.describe('Kanban Board E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start both frontend and backend servers before running tests
    // This assumes both servers are already running
    await page.goto('http://localhost:5173/');
  });

  test('should display the Kanban board with columns', async ({ page }) => {
    // Initial page should have the app title and the three columns
    await expect(page.locator('h1')).toContainText('Real-time Kanban Board');
    await expect(page.locator('.column h2')).toHaveCount(3);
    await expect(page.locator('.column h2').nth(0)).toContainText('To Do');
    await expect(page.locator('.column h2').nth(1)).toContainText('In Progress');
    await expect(page.locator('.column h2').nth(2)).toContainText('Done');
  });

  test('should be able to create a new task', async ({ page }) => {
    // Click the "Add Task" button in the "To Do" column
    await page.locator('.column').filter({ hasText: 'To Do' }).locator('.add-task-btn').click();
    
    // Fill out the task form
    await page.locator('#title').fill('E2E Test Task');
    await page.locator('#description').fill('This task was created during E2E testing');
    await page.locator('#priority').selectOption('High');
    await page.locator('#category').selectOption('Bug');
    
    // Submit the form
    await page.locator('.btn-submit').click();
    
    // Check that the task appears in the "To Do" column
    const todoColumn = page.locator('.column').filter({ hasText: 'To Do' });
    await expect(todoColumn.locator('.task')).toContainText('E2E Test Task');
    await expect(todoColumn.locator('.priority-high')).toContainText('High');
    await expect(todoColumn.locator('.category')).toContainText('Bug');
  });

  test('should be able to edit a task', async ({ page }) => {
    // First create a task
    await page.locator('.column').filter({ hasText: 'To Do' }).locator('.add-task-btn').click();
    await page.locator('#title').fill('Task to Edit');
    await page.locator('#description').fill('This task will be edited');
    await page.locator('.btn-submit').click();
    
    // Now edit the task
    const todoColumn = page.locator('.column').filter({ hasText: 'To Do' });
    await todoColumn.locator('.task').filter({ hasText: 'Task to Edit' }).locator('button', { hasText: 'Edit' }).click();
    
    // Change task details
    await page.locator('#title').fill('Edited Task');
    await page.locator('#description').fill('This task has been edited');
    await page.locator('#priority').selectOption('Low');
    
    // Submit the form
    await page.locator('.btn-submit').click();
    
    // Check that the task has been updated
    await expect(todoColumn.locator('.task')).toContainText('Edited Task');
    await expect(todoColumn.locator('.task')).toContainText('This task has been edited');
    await expect(todoColumn.locator('.priority-low')).toContainText('Low');
  });

  test('should be able to delete a task', async ({ page }) => {
    // First create a task
    await page.locator('.column').filter({ hasText: 'To Do' }).locator('.add-task-btn').click();
    await page.locator('#title').fill('Task to Delete');
    await page.locator('.btn-submit').click();
    
    // Check that the task exists
    const todoColumn = page.locator('.column').filter({ hasText: 'To Do' });
    await expect(todoColumn.locator('.task')).toContainText('Task to Delete');
    
    // Delete the task
    await todoColumn.locator('.task').filter({ hasText: 'Task to Delete' }).locator('button', { hasText: 'X' }).click();
    
    // Check that the task has been removed
    await expect(todoColumn.locator('.task').filter({ hasText: 'Task to Delete' })).toHaveCount(0);
  });

  // This test requires two browser contexts to simulate two users
  test('should sync updates between multiple users', async ({ browser }) => {
    // Create two browser contexts to simulate two users
    const userOneContext = await browser.newContext();
    const userTwoContext = await browser.newContext();
    
    const userOnePage = await userOneContext.newPage();
    const userTwoPage = await userTwoContext.newPage();
    
    // Navigate both users to the app
    await userOnePage.goto('http://localhost:5173/');
    await userTwoPage.goto('http://localhost:5173/');
    
    // User One creates a task
    await userOnePage.locator('.column').filter({ hasText: 'To Do' }).locator('.add-task-btn').click();
    await userOnePage.locator('#title').fill('Shared Task');
    await userOnePage.locator('#description').fill('This task should be visible to all users');
    await userOnePage.locator('.btn-submit').click();
    
    // Check that the task appears for User Two as well
    const userTwoTodoColumn = userTwoPage.locator('.column').filter({ hasText: 'To Do' });
    await expect(userTwoTodoColumn.locator('.task')).toContainText('Shared Task');
    
    // User Two moves the task to "In Progress"
    // Note: In a real application, we'd use drag and drop here, but for simplicity in E2E testing,
    // we can simulate this by directly triggering the WebSocket event
    // This would require a custom function in the app for testing purposes
    
    // Clean up
    await userOneContext.close();
    await userTwoContext.close();
  });
}); 