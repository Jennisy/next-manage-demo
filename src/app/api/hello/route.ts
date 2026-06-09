import { success } from '../../lib/apiResponse'

export async function GET() {
  return success({ message: 'Hello World', time: new Date().toISOString() })
}
