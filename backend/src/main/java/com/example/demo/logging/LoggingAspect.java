package com.example.demo.logging;

import java.util.Arrays;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Pointcut("within(com.example.demo..*)")
    public void applicationPackagePointcut() {
        // Pointcut for application packages
    }

    @Before("applicationPackagePointcut()")
    public void logMethodEntry(JoinPoint joinPoint) {
        if (log.isDebugEnabled()) {
            log.debug("Entering {} with arguments {}", joinPoint.getSignature(), Arrays.toString(joinPoint.getArgs()));
        }
    }

    @AfterReturning(pointcut = "applicationPackagePointcut()", returning = "result")
    public void logMethodExit(JoinPoint joinPoint, Object result) {
        if (log.isDebugEnabled()) {
            log.debug("Exiting {} with result {}", joinPoint.getSignature(), result);
        }
    }

    @AfterThrowing(pointcut = "applicationPackagePointcut()", throwing = "ex")
    public void logMethodException(JoinPoint joinPoint, Throwable ex) {
        if (log.isDebugEnabled()) {
            log.debug("Exception in {} with cause {}", joinPoint.getSignature(), ex.getMessage(), ex);
        }
    }
}
