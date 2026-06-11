import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return {
      service: "imo-foods-api",
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
